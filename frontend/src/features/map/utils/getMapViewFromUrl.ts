import geohash from 'ngeohash';

import { URL_SEARCH_PARAMS } from '~/common/consts';

export function getMapViewFromUrl() {
  const params = new URLSearchParams(document.location.search);
  const lonLatHash = params.get(URL_SEARCH_PARAMS.mapCenter);
  const zoomParam = params.get(URL_SEARCH_PARAMS.zoom);
  const bearingParam = params.get(URL_SEARCH_PARAMS.bearing);
  const pitchParam = params.get(URL_SEARCH_PARAMS.pitch);
  if (!lonLatHash) {
    return undefined;
  }

  const { latitude, longitude } = geohash.decode(lonLatHash);

  return {
    latitude,
    longitude,
    zoom: Number(zoomParam) || 10,
    bearing: Number(bearingParam),
    pitch: Number(pitchParam),
  };
}
