import { Button, Text } from '@adobe/react-spectrum';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAppDispatch } from '~/common/hooks';
import { loggedOut } from '~/features/me/meSlice';

export function LogoutButton() {
  const dispatch = useAppDispatch();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    dispatch(loggedOut());
  };

  return (
    <Button variant="secondary" onPress={handleClick} isDisabled={isPressed}>
      <Text>
        <FormattedMessage defaultMessage="Sign Out" description="logout button" />
      </Text>
    </Button>
  );
}
