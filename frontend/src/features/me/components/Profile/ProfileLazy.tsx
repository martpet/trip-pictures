import { lazy, Suspense } from 'react';

import { LoadingOverlay } from '~/common/components';

const profileImport = import('./Profile');
const Profile = lazy(() => profileImport);

export function ProfileLazy() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Profile />
    </Suspense>
  );
}
