import { Point } from 'geojson';
import { MapboxGeoJSONFeature, MapMouseEvent } from 'mapbox-gl';
import {
  Dispatch,
  MutableRefObject,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { MapRef, useMap } from 'react-map-gl';
import { useSelector } from 'react-redux';

import {
  CLUSTERED_POINT_LAYER,
  PhotoPointFeatureProperties,
  POINT_LAYER,
  useLayerHover,
} from '~/features/map';
import { selectIsPointPreviewModeOn } from '~/features/settings';

type State = Array<{
  feature: MapboxGeoJSONFeature;
  isOnScreen: boolean;
}>;

type Action =
  | {
      type: 'add';
      payload: {
        feature: MapboxGeoJSONFeature;
      };
    }
  | {
      type: 'remove' | 'toggleVisibility';
      payload: MapboxGeoJSONFeature;
    }
  | {
      type: 'removeAll';
    };

function stateReducer(state: State, action: Action) {
  switch (action.type) {
    case 'add': {
      return [
        ...state,
        {
          feature: action.payload.feature,
          isOnScreen: true,
        },
      ];
    }
    case 'remove': {
      return state.filter(({ feature }) => feature.id !== action.payload.id);
    }
    case 'removeAll': {
      return [];
    }
    case 'toggleVisibility': {
      return state.map(({ feature, isOnScreen }) => ({
        feature,
        isOnScreen: feature.id === action.payload.id ? !isOnScreen : isOnScreen,
      }));
    }
    default: {
      return state;
    }
  }
}

export function usePreviewPoints() {
  const [state, dispatch] = useReducer(stateReducer, []);
  const isPreviewMode = useSelector(selectIsPointPreviewModeOn);
  const isRenderListenerLockedRef = useRef(false);
  const { current: mapRef } = useMap();

  useLayerHover(POINT_LAYER, mapRef);

  useEffect(() => {
    isRenderListenerLockedRef.current = false;

    if (!mapRef) {
      return undefined;
    }

    const clickListener = (event: MapMouseEvent) => {
      handleClick({ event, dispatch, state, mapRef });
    };

    const renderListener = () => {
      handleRender({ dispatch, state, isPreviewMode, isRenderListenerLockedRef, mapRef });
    };

    if (!isPreviewMode) {
      mapRef.on('click', clickListener);
    }

    if (isPreviewMode || state.length) {
      mapRef.on('render', renderListener);
    }

    return () => {
      if (!isPreviewMode) {
        mapRef.off('click', clickListener);
      }

      if (isPreviewMode || state.length) {
        mapRef.off('render', renderListener);
      }
    };
  }, [mapRef, state, isPreviewMode]);

  useEffect(() => {
    if (!isPreviewMode) {
      dispatch({ type: 'removeAll' });
    } else if (mapRef) {
      mapRef.triggerRepaint();
    }
  }, [mapRef, isPreviewMode]);

  return useMemo(() => {
    const result = state
      .filter(({ isOnScreen }) => isOnScreen)
      .map(({ feature }) => {
        const { coordinates } = feature.geometry as Point;
        const {
          fingerprint,
          point_count_abbreviated: count,
          cluster_id: clusterId,
        } = feature.properties as PhotoPointFeatureProperties & {
          point_count_abbreviated?: string;
          cluster_id?: number;
        };

        const { id } = feature;
        return { feature, coordinates, fingerprint, id, clusterId, count };
      });

    return result;
  }, [state]);
}

function handleClick({
  event,
  dispatch,
  state,
  mapRef,
}: {
  event: MapMouseEvent;
  dispatch: Dispatch<Action>;
  state: State;
  mapRef: MapRef;
}) {
  const eventFeatures = mapRef.queryRenderedFeatures(event.point);
  const clickedPoint = eventFeatures.find(({ layer }) => {
    return [POINT_LAYER, CLUSTERED_POINT_LAYER].includes(layer.id);
  });

  if (!clickedPoint) {
    dispatch({ type: 'removeAll' });
  } else if (
    clickedPoint.layer.id === POINT_LAYER &&
    state.every(({ feature }) => feature.id !== clickedPoint.id)
  ) {
    dispatch({ type: 'add', payload: { feature: clickedPoint } });
  }
}

function handleRender({
  dispatch,
  state,
  isPreviewMode,
  isRenderListenerLockedRef,
  mapRef,
}: {
  dispatch: Dispatch<Action>;
  state: State;
  isPreviewMode: boolean;
  isRenderListenerLockedRef: MutableRefObject<boolean>;
  mapRef: MapRef;
}) {
  if (
    isRenderListenerLockedRef.current ||
    !mapRef.getLayer(POINT_LAYER) ||
    !mapRef.getLayer(CLUSTERED_POINT_LAYER)
  ) {
    return;
  }

  const renderedFeatures = mapRef.queryRenderedFeatures(undefined, {
    layers: [POINT_LAYER, CLUSTERED_POINT_LAYER],
  });

  const renderedIds = renderedFeatures.map(({ id }) => id);
  const stateIds = state.map(({ feature }) => feature.id);

  state.forEach(({ feature, isOnScreen }) => {
    const isRendered = renderedIds.includes(feature.id);

    if (!isPreviewMode) {
      if ((isRendered && !isOnScreen) || (!isRendered && isOnScreen)) {
        dispatch({ type: 'toggleVisibility', payload: feature });
        isRenderListenerLockedRef.current = true;
      }
    } else if (!isRendered) {
      dispatch({ type: 'remove', payload: feature });
      isRenderListenerLockedRef.current = true;
    }
  });

  if (isPreviewMode) {
    const processedIds: (string | number)[] = [];

    renderedFeatures.forEach((feature) => {
      if (typeof feature.id === 'undefined') {
        throw new Error('feature must have id');
      }
      if (!processedIds.includes(feature.id)) {
        processedIds.push(feature.id);

        const isInState = stateIds.includes(feature.id);

        if (!isInState) {
          dispatch({ type: 'add', payload: { feature } });
          isRenderListenerLockedRef.current = true;
        }
      }
    });
  }
}
