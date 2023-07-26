import { lazy, Suspense } from 'react';
import { useRoute } from 'wouter';

import { LoadingOverlay } from '~/common/components';
import { useGetPointsQuery, useRefetchAwsCredentials } from '~/features/map';

const Map = lazy(() => import('./Map'));

export function MapLazy() {
  const [isVisible] = useRoute('/');

  useGetPointsQuery();
  useRefetchAwsCredentials();

  return (
    <Suspense fallback={<LoadingOverlay isHidden={!isVisible} />}>
      <Map isVisible={isVisible} />
    </Suspense>
  );
}
