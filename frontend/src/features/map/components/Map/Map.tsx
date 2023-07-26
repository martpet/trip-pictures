import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import MapGl, { MapRef } from 'react-map-gl';
import { useSelector } from 'react-redux';

import { LoadingOverlay } from '~/common/components';
import { MAP_ID, TOOLBAR_HEIGHT } from '~/common/consts';
import { useAppDispatch, useIsLoadingInitialTranslations } from '~/common/hooks';
import {
  mapMoved,
  selectMapView,
  useMapRequestTransformer,
  useMapStyle,
} from '~/features/map';

import { MapChildren } from './MapChildren';

interface MapProps {
  isVisible: boolean;
}

export default function Map({ isVisible }: MapProps) {
  const storedState = useSelector(selectMapView);

  const [viewState, setViewState] = useState(storedState);
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useMapStyle();
  const requestTransformer = useMapRequestTransformer();
  const { isLoadingInitialTranslations } = useIsLoadingInitialTranslations();

  useEffect(() => {
    setViewState(storedState);
  }, [storedState]);

  useEffect(() => {
    setViewState(storedState);
  }, [storedState]);

  useEffect(() => {
    document.documentElement.style.overflow = isVisible ? 'hidden' : 'initial';
    return () => {
      document.documentElement.style.overflow = 'initial';
    };
  }, [isVisible]);

  if (!requestTransformer || !mapStyle || isLoadingInitialTranslations) {
    return <LoadingOverlay isHidden={!isVisible} />;
  }

  return (
    <MapGl
      {...viewState}
      id={MAP_ID}
      mapStyle={mapStyle}
      mapLib={maplibregl}
      attributionControl={false}
      transformRequest={requestTransformer}
      onMove={(evt) => setViewState(evt.viewState)}
      onMoveEnd={(evt) => dispatch(mapMoved(evt.viewState))}
      ref={mapRef}
      fadeDuration={0}
      padding={{ top: TOOLBAR_HEIGHT, bottom: 0, left: 0, right: 0 }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100vh',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <MapChildren />
    </MapGl>
  );
}
