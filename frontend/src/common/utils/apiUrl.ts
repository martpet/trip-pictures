// [todo] Use URLPattern when supported by FF (https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)

import { Schema } from 'type-fest';

import { apiBaseUrl } from '~/common/consts';
import {
  ApiPath,
  ApiQueryStrings,
  PathParams,
  RouteWithQueryStrings,
} from '~/common/types';

export function apiUrl<T extends ApiPath>(
  pattern: T,
  {
    pathParams,
    searchParams,
  }: {
    pathParams?: PathParams<T>;
    searchParams?: T extends RouteWithQueryStrings
      ? Partial<Schema<ApiQueryStrings<T>, string>>
      : never;
  } = {}
) {
  let path = pattern as string;

  if (path.includes(':')) {
    path = '';

    pattern
      .substring(1)
      .split('/')
      .forEach((part) => {
        let replacedPart = part;

        if (part.startsWith(':')) {
          const paramName = part.substring(1);
          const value = pathParams?.[paramName];

          if (!value) {
            throw new Error(`"apiUrl" needs value for "${paramName}" in ${pattern}`);
          }

          replacedPart = value;
        }

        path = `${path}/${replacedPart}`;
      });
  }

  const url = new URL(path, apiBaseUrl);

  if (searchParams) {
    url.search = new URLSearchParams(searchParams).toString();
  }

  return url.href;
}
