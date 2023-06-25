import { useEffect } from 'react';

import { useGetAwsCredentialsQuery } from '~/app';

export function useRefetchAwsCredentials() {
  const result = useGetAwsCredentialsQuery();
  const { data, isFetching, refetch } = result;
  const expiration = data?.expiration;

  useEffect(() => {
    if (!expiration) {
      return undefined;
    }

    let timeoutId: number;

    const setCounter = () => {
      clearTimeout(timeoutId);

      const timeRemaining = expiration - Date.now() - 60 * 1000;

      timeoutId = window.setTimeout(() => {
        if (!isFetching) {
          refetch();
        }
      }, timeRemaining);
    };

    setCounter();

    window.addEventListener('focus', setCounter);
    window.addEventListener('online', setCounter);

    return () => {
      window.removeEventListener('focus', setCounter);
      window.removeEventListener('online', setCounter);
      clearTimeout(timeoutId);
    };
  }, [expiration, isFetching, refetch]);

  return result;
}
