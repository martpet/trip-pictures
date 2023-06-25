import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseUrl } from '~/common/consts';

import { customBaseQuery } from './customBaseQuery';

export const api = createApi({
  baseQuery: customBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: 'include',
  }),

  endpoints: () => ({}),
});
