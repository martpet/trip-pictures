import { lazy, Suspense } from 'react';

import { LoadingOverlay } from '~/common/components';

const Area = lazy(() => import('./Area'));

export function AreaLazy() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Area />
    </Suspense>
  );
}
