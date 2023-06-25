import fetchIntercept, { FetchInterceptor } from 'fetch-intercept';
import { EventData } from 'mapbox-gl';
import { useEffect } from 'react';
import { useMap } from 'react-map-gl';

import { MAP_ID } from '~/common/consts';
import { isAwsMapUrl } from '~/features/map';

export type MapRequestsEventHandlers = {
  onDataLoading?(event: EventData): void;
  onData?(event: EventData): void;
  onDataAbort?(event: EventData): void;
  onFetchRequest?(input: any): void | Promise<void>;
  onFetchRequestError?(error: any): void | Promise<void>;
  onFetchResponse?(response: Response): void;
};

export function useMapRequestsEvents({
  onDataLoading,
  onData,
  onDataAbort,
  onFetchRequest,
  onFetchRequestError,
  onFetchResponse,
}: MapRequestsEventHandlers) {
  const { [MAP_ID]: mapRef } = useMap();

  useEffect(() => {
    const interceptor: FetchInterceptor = {};
    let unregister: () => void;

    if (onFetchRequest) {
      interceptor.request = async (input, config) => {
        if (isAwsMapUrl(input) && onFetchRequest) {
          await onFetchRequest(input);
        }
        return [input, config];
      };
    }

    if (onFetchRequestError) {
      interceptor.requestError = async (error) => {
        await onFetchRequestError(error);
        return Promise.reject(error);
      };
    }

    if (onFetchResponse) {
      interceptor.response = (response) => {
        if (isAwsMapUrl(response.url) && onFetchResponse) {
          onFetchResponse(response);
        }
        return response;
      };
    }

    if (Object.keys(interceptor).length) {
      unregister = fetchIntercept.register(interceptor);
    }

    return () => {
      if (unregister) {
        unregister();
      }
    };
  }, [onFetchRequest, onFetchRequestError, onFetchResponse]);

  useEffect(() => {
    if (!mapRef) {
      return undefined;
    }

    if (onDataLoading) {
      mapRef.on('dataloading', onDataLoading);
    }

    if (onData) {
      mapRef.on('data', onData);
    }

    if (onDataAbort) {
      mapRef.on('dataabort', onDataAbort);
    }

    return () => {
      if (onDataLoading) {
        mapRef.off('dataloading', onDataLoading);
      }

      if (onData) {
        mapRef.off('data', onData);
      }

      if (onDataAbort) {
        mapRef.off('dataabort', onDataAbort);
      }
    };
  }, [mapRef, onDataLoading, onData, onDataAbort]);
}
