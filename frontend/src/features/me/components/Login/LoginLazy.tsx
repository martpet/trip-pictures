import { lazy, Suspense } from 'react';

import { LoadingOverlay } from '~/common/components';

const loginImport = import('./Login');
const Login = lazy(() => loginImport);

type Props = {
  onLoginButtonClick?: () => void;
};

export function LoginLazy({ onLoginButtonClick }: Props) {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Login onLoginButtonClick={onLoginButtonClick} />
    </Suspense>
  );
}
