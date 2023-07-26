import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MessageFormatElement } from 'react-intl';

import { defaultLocale } from '~/common/consts';
import { Language } from '~/common/types';

export const publicDirApi = createApi({
  reducerPath: 'publicDirApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),

  endpoints: (build) => ({
    getTranslations: build.query<Record<string, MessageFormatElement[]> | null, Language>(
      {
        queryFn(arg, api, extraOptions, baseQuery) {
          if (arg === defaultLocale) {
            return { data: null };
          }

          return baseQuery(`/translations/${arg}.json`) as any;
        },
      }
    ),
  }),
});

export const { useGetTranslationsQuery } = publicDirApi;
export const { getTranslations } = publicDirApi.endpoints;
