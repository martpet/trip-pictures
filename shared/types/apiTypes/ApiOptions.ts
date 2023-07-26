import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Merge, ReadonlyDeep, RequireAtLeastOne } from 'type-fest';

export type ApiOptions = Record<`/${string}`, ApiRouteOptions>;

export type ApiRouteOptions = {
  methods: RequireAtLeastOne<Record<ApiMethod, ApiMethodOptions>>;
  cookies?: Readonly<string[]>;
  queryStrings?: Readonly<string[]>;
  headers?: Readonly<string[]>;
  cacheProps?: {
    minTtl?: number;
    maxTtl?: number;
    defaultTtl?: number;
  };
};

export type ApiMethod = 'GET' | 'POST' | 'PATCH';

export type ApiMethodOptions = {
  isPublic?: boolean;
  envVars?: Readonly<string[]>;

  handlerProps?: ReadonlyDeep<
    Merge<
      NodejsFunctionProps,
      {
        // can't use Duration from aws-cdk-lib due to lambda layer size limit
        // https://github.com/aws/aws-cdk/issues/16442
        timeout?: number;
      }
    >
  >;
};

// [todo]  create a type from path parameter in pathname (/images/:fingerprint), use it in handlers event.pathParameters:
// https://github.com/microsoft/TypeScript/issues/41160
// https://github.com/sindresorhus/type-fest/issues/516
