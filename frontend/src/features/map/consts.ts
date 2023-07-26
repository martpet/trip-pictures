import { SpectrumColorValue } from '~/common/types';

export const MAP_PRECISION = {
  pointHash: 9,
  clusterBBoxHash: 6,
  lonlat: 6,
  zoom: 2,
  pitch: 2,
  bearing: 0,
  altitude: 0,
  speed: 0,
  hPositioningError: 0,
};

// Layers
export const POINT_LAYER = 'photoPoint';
export const CLUSTERED_POINT_LAYER = 'clusteredPhotoPoint';

// Color
export const colors = {
  pin: 'gray-900',
  pinHover: 'blue-1000',
  pinCount: 'blue-900',
  pinCountText: 'gray-50',
} satisfies Record<string, SpectrumColorValue>;

// Sizes
export const PIN_SIZE = 50;
