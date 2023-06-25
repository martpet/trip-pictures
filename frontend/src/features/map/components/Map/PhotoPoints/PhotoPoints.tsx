import { Layer, Marker, Source, useMap } from 'react-map-gl';
import { useSelector } from 'react-redux';

import { POINTS_SOURCE_ID } from '~/common/consts';
import {
  CLUSTERED_POINT_LAYER,
  ClusterProperties,
  useExpandClusterOnClick,
} from '~/features/map';
import { selectIsPointPreviewModeOn } from '~/features/settings';

import { PhotoPointPreview } from './PhotoPointPreview';
import { usePhotoPointsGeoJson } from './usePhotoPointsGeoJson';
import { usePointsLayers } from './usePointsLayers';
import { usePreviewPoints } from './usePreviewPoints';

export function PhotoPoints() {
  const geojson = usePhotoPointsGeoJson();
  const layers = usePointsLayers();
  const previewPoints = usePreviewPoints();
  const isPreviewMode = useSelector(selectIsPointPreviewModeOn);
  const { current: mapRef } = useMap();

  const clusterProperties = {
    fingerprint: [['accumulated'], ['get', 'fingerprint']],
  } satisfies ClusterProperties;

  useExpandClusterOnClick(CLUSTERED_POINT_LAYER, mapRef);

  if (!geojson) {
    return null;
  }

  return (
    <>
      <Source
        id={POINTS_SOURCE_ID}
        type="geojson"
        data={geojson}
        generateId
        cluster
        clusterMaxZoom={18}
        // https://github.com/visgl/react-map-gl/discussions/2127
        clusterRadius={isPreviewMode ? 75 : 50}
        clusterProperties={clusterProperties}
      >
        {layers?.map((layerProps) => (
          <Layer key={layerProps.id} {...layerProps} />
        ))}
      </Source>

      {previewPoints.map(({ id, coordinates, ...previewProps }) => (
        <Marker
          key={id}
          longitude={coordinates[0]}
          latitude={coordinates[1]}
          anchor="bottom"
        >
          <PhotoPointPreview {...previewProps} />
        </Marker>
      ))}
    </>
  );
}
