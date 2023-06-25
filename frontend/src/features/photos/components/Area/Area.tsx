import { useMemo } from 'react';

import { LoadingOverlay } from '~/common/components';
import { useAppRoute } from '~/common/hooks';
import { useGetPointsQuery } from '~/features/map';

import { photoPointsInBBox } from '../../photosUtils';
import { Gallery } from './Gallery';

export default function Area() {
  const { data: photoPoints, isLoading } = useGetPointsQuery();
  const [, urlParams] = useAppRoute('/:bboxHash');

  const filteredPhotoPoints = useMemo(() => {
    if (!photoPoints) return [];
    if (!urlParams?.bboxHash) return photoPoints;
    return photoPointsInBBox(photoPoints, urlParams.bboxHash);
  }, [photoPoints, urlParams]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return <Gallery photos={filteredPhotoPoints} />;
}
