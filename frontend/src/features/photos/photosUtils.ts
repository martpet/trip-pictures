import { LngLatBounds } from 'maplibre-gl';
import geohash from 'ngeohash';

import { PhotoPoint } from '~/common/types';
import { parsePhotoFingerprint } from '~/common/utils';
import { MAP_PRECISION } from '~/features/map';

export function photoPointsInBBox(photoPoints: PhotoPoint[], bboxHash: string) {
  const bounds = getBounds(bboxHash);
  return photoPoints.filter(({ fingerprint }) => {
    const { lon, lat } = parsePhotoFingerprint(fingerprint);
    return bounds.contains([lon, lat]);
  });
}

export function getBounds(bboxHash: string) {
  const sw = geohash.decode(bboxHash.slice(0, MAP_PRECISION.clusterBBoxHash));
  const ne = geohash.decode(bboxHash.slice(MAP_PRECISION.clusterBBoxHash));
  const west = sw.longitude - sw.error.longitude;
  const south = sw.latitude - sw.error.latitude;
  const east = ne.longitude + ne.error.longitude;
  const north = ne.latitude + ne.error.latitude;
  return new LngLatBounds([west, south], [east, north]);
}
