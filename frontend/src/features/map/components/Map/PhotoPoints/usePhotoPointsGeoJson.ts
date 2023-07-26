import { FeatureCollection, Point, point } from '@turf/helpers';
import { useMemo } from 'react';

import { parsePhotoFingerprint } from '~/common/utils';
import { PhotoPointFeatureProperties, useGetPointsQuery } from '~/features/map';

export function usePhotoPointsGeoJson() {
  const { data } = useGetPointsQuery();

  return useMemo<
    FeatureCollection<Point, PhotoPointFeatureProperties> | undefined
  >(() => {
    if (!data) {
      return undefined;
    }

    return {
      type: 'FeatureCollection',
      features: data.map((item) => {
        const { lon, lat } = parsePhotoFingerprint(item.fingerprint);
        return point([lon, lat], item);
      }),
    };
  }, [data]);
}
