import { MapMouseEvent } from 'mapbox-gl';
import { useEffect } from 'react';
import { MapRef } from 'react-map-gl';

import { expandCluster, useLayerHover } from '~/features/map';

export function useExpandClusterOnClick(layerId: string, mapRef?: MapRef) {
  useLayerHover(layerId, mapRef);

  useEffect(() => {
    if (!mapRef) {
      return undefined;
    }

    const clickListener = (event: MapMouseEvent) => {
      expandCluster({ event, mapRef, layers: [layerId] });
    };

    mapRef.on('click', layerId, clickListener);

    return () => {
      mapRef.off('click', layerId, clickListener);
    };
  }, [mapRef, layerId]);
}
