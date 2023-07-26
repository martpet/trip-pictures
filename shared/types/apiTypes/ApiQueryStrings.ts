import { ConditionalKeys } from 'type-fest';

import { apiOptions } from '../../consts/apiOptions';
import { ApiRouteOptions } from './ApiOptions';

export type RouteWithQueryStrings = ConditionalKeys<
  typeof apiOptions,
  Pick<ApiRouteOptions, 'queryStrings'>
>;

export type ApiQueryStrings<T extends RouteWithQueryStrings> = Partial<
  Record<(typeof apiOptions)[T]['queryStrings'][number], string>
>;
