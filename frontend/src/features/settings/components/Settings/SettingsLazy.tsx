import { lazy, Suspense } from 'react';

import { LoadingOverlay } from '~/common/components';

const settingsImport = import('./Settings');
const Settings = lazy(() => settingsImport);

export function SettingsLazy() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Settings />
    </Suspense>
  );
}
