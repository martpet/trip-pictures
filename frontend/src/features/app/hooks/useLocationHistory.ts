import { useEffect } from 'react';
import { useLocation } from 'wouter';

import { useAppDispatch } from '~/common/hooks';
import { locationChanged } from '~/features/app/appSlice';

export function useLocationHistory() {
  const [location] = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(locationChanged(location));
  }, [location]);
  return false;
}
