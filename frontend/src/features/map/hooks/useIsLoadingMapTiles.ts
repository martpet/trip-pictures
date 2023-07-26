import { EventData } from 'mapbox-gl';
import { useMemo, useReducer } from 'react';

import { useDebouncedLoader } from '~/common/hooks';
import { MapRequestsEventHandlers, useMapRequestsEvents } from '~/features/map';

const coordKeys = new Set();

function reducer(state: number, action: 'requestStarted' | 'requestEnded') {
  switch (action) {
    case 'requestStarted': {
      return state + 1;
    }
    case 'requestEnded': {
      return Math.max(0, state - 1);
    }
    default:
      return state;
  }
}

export const useIsLoadingMapTiles = () => {
  const [loaders, dispatch] = useReducer(reducer, 0);
  const isLoading = useDebouncedLoader(loaders > 0);

  const handlers = useMemo(
    (): MapRequestsEventHandlers => ({
      onDataLoading({ coord, source }: EventData) {
        if (source?.type === 'vector' && coord?.key && !coordKeys.has(coord?.key)) {
          coordKeys.add(coord?.key);
          dispatch('requestStarted');
        }
      },

      onData({ coord, source }: EventData) {
        if (source?.type === 'vector' && coordKeys.has(coord?.key)) {
          coordKeys.delete(coord?.key);
          dispatch('requestEnded');
        }
      },

      onDataAbort({ coord, source }: EventData) {
        if (source?.type === 'vector' && coordKeys.has(coord?.key)) {
          coordKeys.delete(coord?.key);
          dispatch('requestEnded');
        }
      },

      onFetchRequest() {
        dispatch('requestStarted');
      },

      onFetchResponse() {
        dispatch('requestEnded');
      },
    }),
    [dispatch]
  );

  useMapRequestsEvents(handlers);

  return isLoading;
};
