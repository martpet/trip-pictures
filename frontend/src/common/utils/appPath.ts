// [todo] Use URLPattern when supported by FF (https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)

import { PathParams } from '~/common/types';
import { AppPath } from '~/common/types/AppPath';

export function appPath<T extends AppPath>(pattern: T, params?: PathParams<T>) {
  let path = pattern as string;

  if (path.includes(':')) {
    path = '';

    pattern
      .substring(1)
      .split('/')
      .forEach((part) => {
        let replacedPathPart = part;

        if (part.startsWith(':')) {
          const paramName = part.substring(1);
          const value = params?.[paramName];

          if (!value) {
            throw new Error(`"appPath" needs value for "${paramName}" in ${pattern}`);
          }

          replacedPathPart = value;
        }

        path = `${path}/${replacedPathPart}`;
      });
  }

  return path;
}
