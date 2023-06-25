import { useEffect, useState } from 'react';

export function useDebouncedLoader(
  isLoading: boolean,
  { delayIn = 1000, delayOut = 300 } = {}
) {
  const [debouncedValue, setDebouncedValue] = useState(isLoading);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        setDebouncedValue(isLoading);
      },
      isLoading ? delayIn : delayOut
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, delayIn, delayOut]);

  return debouncedValue;
}
