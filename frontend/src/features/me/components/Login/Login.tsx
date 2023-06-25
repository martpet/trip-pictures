import { Flex } from '@adobe/react-spectrum';
import { isWebKit } from '@react-aria/utils';

import { Spinner } from '~/common/components';
import { useAppSelector } from '~/common/hooks';
import { selectIsLoadingMe } from '~/features/me';

import { LoginButton } from './LoginButton';

type Props = {
  onLoginButtonClick?: () => void;
};

export default function Login({ onLoginButtonClick }: Props) {
  const isLoadingMe = useAppSelector(selectIsLoadingMe);

  const handleButtonClick = () => {
    if (onLoginButtonClick) {
      onLoginButtonClick();
    }
  };

  const loginButtons = [
    <LoginButton key="g" provider="Google" onClick={handleButtonClick} />,
    <LoginButton key="a" provider="SignInWithApple" onClick={handleButtonClick} />,
  ];

  if (isWebKit()) {
    loginButtons.reverse();
  }

  return (
    <Flex justifyContent="center" alignItems="center" UNSAFE_style={{ height: '100%' }}>
      {isLoadingMe ? (
        <Spinner />
      ) : (
        <Flex direction="column" gap="size-250">
          {loginButtons}
        </Flex>
      )}
    </Flex>
  );
}
