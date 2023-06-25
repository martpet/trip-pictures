import 'urlpattern-polyfill';

import { apiOptions } from '../consts';
import { publicEndpoints } from '../consts/publicEndpoints';
import { ApiMethod, ApiPath } from '../types';

type Props = {
  path: string;
  method: string;
};

const paths = Object.keys(apiOptions);

export function isPublicEndpoint({ path, method }: Props) {
  const match = paths.find((pattern) => {
    return new URLPattern({ pathname: pattern }).test({ pathname: path });
  });

  return Boolean(publicEndpoints[match as ApiPath]?.includes(method as ApiMethod));
}
