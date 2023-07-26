import { AppPath, PathParams } from '~/common/types';

export type AppPathParam<T extends AppPath> = PathParams<T>;
