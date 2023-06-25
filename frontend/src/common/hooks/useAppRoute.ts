import { useRoute } from 'wouter';

import { AppPath, AppPathParam } from '~/common/types';

export function useAppRoute<T extends AppPath>(pattern: T) {
  return useRoute<AppPathParam<T>>(pattern);
}
