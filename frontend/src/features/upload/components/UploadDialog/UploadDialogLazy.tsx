import { Dialog } from '@adobe/react-spectrum';
import { lazy, Suspense } from 'react';

import { LoadingOverlay } from '~/common/components';

const uploadDialogImport = import('./UploadDialog/UploadDialog');
const UploadDialog = lazy(() => uploadDialogImport);

export function UploadDialogLazy() {
  return (
    <Dialog>
      <Suspense fallback={<LoadingOverlay />}>
        <UploadDialog />
      </Suspense>
    </Dialog>
  );
}
