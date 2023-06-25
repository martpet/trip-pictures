import { useEffect } from 'react';
import { MapRef } from 'react-map-gl';

export function useLayerHover(layerId?: string, mapRef?: MapRef) {
  useEffect(() => {
    if (!mapRef || !layerId) {
      return undefined;
    }

    const onmouseenter = () => {
      mapRef.getCanvas().style.cursor = 'pointer';
    };

    const onmouseout = () => {
      mapRef.getCanvas().style.cursor = '';
    };

    mapRef.on('mouseenter', layerId, onmouseenter);
    mapRef.on('mouseout', layerId, onmouseout);

    return () => {
      mapRef.off('mouseenter', layerId, onmouseenter);
      mapRef.off('mouseout', layerId, onmouseout);
    };
  }, [mapRef, layerId]);
}
