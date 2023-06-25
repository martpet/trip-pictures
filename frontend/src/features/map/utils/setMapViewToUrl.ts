import geohash from 'ngeohash';

import { URL_SEARCH_PARAMS } from '~/common/consts';
import { MAP_PRECISION, MapView } from '~/features/map';

export function setMapViewToUrl(view: MapView) {
  const url = new URL(window.location.href);
  const { longitude, latitude, zoom, bearing, pitch } = view;

  url.searchParams.set(
    URL_SEARCH_PARAMS.mapCenter,
    geohash.encode(latitude, longitude, MAP_PRECISION.pointHash)
  );

  if (zoom) {
    url.searchParams.set(
      URL_SEARCH_PARAMS.zoom,
      Number(zoom.toFixed(MAP_PRECISION.zoom)).toString()
    );
  } else {
    url.searchParams.delete(URL_SEARCH_PARAMS.zoom);
  }

  if (pitch) {
    url.searchParams.set(
      URL_SEARCH_PARAMS.pitch,
      Number(pitch.toFixed(MAP_PRECISION.pitch)).toString()
    );
  } else {
    url.searchParams.delete(URL_SEARCH_PARAMS.pitch);
  }

  if (bearing) {
    url.searchParams.set(
      URL_SEARCH_PARAMS.bearing,
      Number(bearing.toFixed(MAP_PRECISION.bearing)).toString()
    );
  } else {
    url.searchParams.delete(URL_SEARCH_PARAMS.bearing);
  }

  window.history.replaceState(null, '', url);
}
