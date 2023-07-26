import { Merge } from 'type-fest';
import { Route, RouteProps } from 'wouter';

import { AppPath } from '~/common/types';

type AppRouteProps = Merge<RouteProps, { path?: AppPath }>;

export function AppRoute(props: AppRouteProps) {
  return <Route {...props} />;
}
