import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';

import { ThemeProvider } from '~/app';
import { LoadingOverlay } from '~/common/components';
import { selectHasAppLoaders } from '~/features/app';

export function AppLoadingOverlay() {
  const container = document.getElementById('overlay') as HTMLElement;
  const isLoading = useSelector(selectHasAppLoaders);

  if (!isLoading) {
    return null;
  }

  return createPortal(
    <ThemeProvider>
      <LoadingOverlay dim />
    </ThemeProvider>,
    container
  );
}
