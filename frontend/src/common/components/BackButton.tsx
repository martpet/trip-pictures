import { ActionButton, Text } from '@adobe/react-spectrum';
import { useIsMobileDevice } from '@react-spectrum/utils';
import MapIcon from '@spectrum-icons/workflow/MapView';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'wouter';

import { selectBreadrumbs } from '~/features/app/appSlice';

interface BackButtonProps {
  path: string;
}

export function BackButton({ path }: BackButtonProps) {
  const [, setLocation] = useLocation();
  const breadcrumbs = useSelector(selectBreadrumbs);
  const prevPath = breadcrumbs.at(-2);
  const isMobile = useIsMobileDevice();

  const onPress = () => {
    if (path === prevPath) {
      window.history.back();
    } else {
      setLocation(path);
    }
  };

  return (
    <ActionButton isQuiet onPress={onPress}>
      <MapIcon />
      {!isMobile && (
        <Text>
          <FormattedMessage defaultMessage="Map" description="map button" />
        </Text>
      )}
    </ActionButton>
  );
}
