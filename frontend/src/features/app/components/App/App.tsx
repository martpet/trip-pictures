import { Flex } from '@adobe/react-spectrum';
import { ToastContainer } from '@react-spectrum/toast';
import { useMap } from 'react-map-gl';
import { useRoute } from 'wouter';

import { MAP_ID } from '~/common/consts';
import { useAppRoute } from '~/common/hooks';
import { MapLazy } from '~/features/map';
import { AreaLazy } from '~/features/photos';

import {
  useDisableDragDrop,
  useLocationHistory,
  useThemeColorMetaTag,
} from '../../hooks';
import { AppLoadingOverlay } from './AppLoadingOverlay';
import { AppLoginDialog } from './AppLoginDialog';
import { LoginRedirect } from './LoginRedirect';
import { Toolbar } from './Toolbar/Toolbar';

export function App() {
  const [isRootPath] = useRoute('/');
  const [isLoginPath] = useAppRoute('/login/:provider');
  const [isAreaPath] = useAppRoute('/:bboxHash');
  const { [MAP_ID]: mapRef } = useMap();

  useLocationHistory();
  useThemeColorMetaTag();
  useDisableDragDrop();

  if (isLoginPath) {
    return <LoginRedirect />;
  }

  return (
    <>
      <AppLoadingOverlay />
      <AppLoginDialog />
      <ToastContainer />

      <Flex minHeight="100vh" direction="column">
        <Toolbar />
        {(isRootPath || mapRef) && <MapLazy />}
        {isAreaPath && <AreaLazy />}
      </Flex>
    </>
  );
}
