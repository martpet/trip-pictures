import { AnyLayer, SymbolLayer } from 'mapbox-gl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import iconCameraSVG from '~/assets/spectrum-icons/camera.svg';
import iconCircleSVG from '~/assets/spectrum-icons/circle.svg';
import iconLocationSVG from '~/assets/spectrum-icons/location.svg';
import { getCSSColor } from '~/common/utils';
import {
  CLUSTERED_POINT_LAYER,
  colors,
  PIN_SIZE,
  POINT_LAYER,
  useMapImages,
} from '~/features/map';
import { selectIsPointPreviewModeOn } from '~/features/settings';

const images = [
  {
    name: 'location',
    path: iconLocationSVG,
    width: PIN_SIZE,
    height: PIN_SIZE,
  },
  {
    name: 'circle',
    path: iconCircleSVG,
    width: 20,
    height: 20,
    // Can't stretch with sdf icons: https://github.com/mapbox/mapbox-gl-js/issues/10026
    // stretchX: [[8, 12]] as [number, number][],
  },
  {
    name: 'camera',
    path: iconCameraSVG,
    width: 18,
    height: 18,
  },
];

export function usePointsLayers() {
  const [layers, setLayers] = useState<AnyLayer[]>();
  const isImagesAdded = useMapImages({ images });
  const isPreviewMode = useSelector(selectIsPointPreviewModeOn);

  useEffect(() => {
    if (!isImagesAdded) {
      setLayers(undefined);
      return;
    }

    const PIN_COLOR = getCSSColor(colors.pin);

    const pinProps: Partial<SymbolLayer> = {
      layout: {
        'icon-image': 'location',
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
      },
      paint: {
        'icon-color': PIN_COLOR,
        'icon-halo-color': PIN_COLOR,
        'icon-halo-blur': 3,
        'icon-halo-width': 1,
        'icon-opacity': isPreviewMode ? 0 : 1,
      },
    };

    setLayers([
      {
        id: CLUSTERED_POINT_LAYER,
        type: 'symbol',
        filter: ['has', 'point_count'],
        ...pinProps,
      },
      {
        id: POINT_LAYER,
        type: 'symbol',
        filter: ['!', ['has', 'point_count']],
        ...pinProps,
      },
      {
        id: 'pinFiller',
        type: 'symbol',
        layout: {
          'icon-image': 'circle',
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-offset': [0, -20],
        },
        paint: {
          'icon-color': PIN_COLOR,
          'icon-opacity': isPreviewMode ? 0 : 1,
        },
      },
      {
        id: 'cameraIcon',
        type: 'symbol',
        layout: {
          'icon-image': 'camera',
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-offset': [0, -20],
        },
        paint: {
          'icon-color': getCSSColor('gray-50'),
          'icon-opacity': isPreviewMode ? 0 : 1,
        },
      },
      {
        id: 'count',
        type: 'symbol',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Ubuntu Regular'], // todo: get font from mapOptions
          'text-size': 11,
          'text-offset': [0.9, -4],
          'icon-image': 'circle',
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-text-fit': 'both',
          'icon-text-fit-padding': [4, 6, 2, 6],
        },
        paint: {
          'text-color': getCSSColor(colors.pinCountText),
          'icon-color': getCSSColor(colors.pinCount),
          'icon-halo-color': getCSSColor(colors.pinCount),
          'icon-halo-blur': 3,
          'icon-halo-width': 1,
          'text-opacity': isPreviewMode ? 0 : 1,
          'icon-opacity': isPreviewMode ? 0 : 1,
        },
      },
    ]);
  }, [isImagesAdded, isPreviewMode]);

  return layers;
}
