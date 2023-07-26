import { Flex } from '@adobe/react-spectrum';
import { useEffect } from 'react';

import { LoadingOverlay } from '~/common/components';
import { useAppRoute } from '~/common/hooks';
import { apiUrl } from '~/common/utils';

export function LoginRedirect() {
  const [, urlParams] = useAppRoute('/login/:provider');
  const provider = urlParams?.provider;
  const url = `${apiUrl('/login', { searchParams: { provider } })}`;

  useEffect(() => {
    if (!provider) {
      throw new Error('Missing "provider" url param');
    }

    window.location.replace(url);
  }, []);

  return (
    <Flex height="100vh">
      <LoadingOverlay />
    </Flex>
  );
}
