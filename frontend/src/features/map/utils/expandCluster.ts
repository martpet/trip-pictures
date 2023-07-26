import { Point } from 'geojson';
import { GeoJSONSource, MapMouseEvent } from 'mapbox-gl';
import { LngLatLike } from 'maplibre-gl';
import { MapRef } from 'react-map-gl';

type Props = {
  event: MapMouseEvent;
  mapRef: MapRef;
  layers: string[];
};

export function expandCluster({ event, mapRef, layers }: Props) {
  const feature = mapRef.queryRenderedFeatures(event.point, { layers })[0];
  const source = mapRef.getSource(feature.source) as GeoJSONSource;
  const clusterId = feature.properties?.cluster_id;
  const geometry = feature.geometry as Point;

  source.getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (!err) {
      mapRef.easeTo({
        center: geometry.coordinates as LngLatLike,
        zoom,
        duration: 500,
      });
    }
  });
}
