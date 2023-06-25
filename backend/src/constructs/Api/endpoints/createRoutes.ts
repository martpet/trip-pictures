import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { capitalize } from 'lambda-layer';

import { Auth, Photos } from '~/constructs';
import { AllEnvVars } from '~/constructs/Api/types';
import { createNodejsFunction } from '~/constructs/utils';
import { apiOptions } from '~/consts';
import { ApiMethodOptions } from '~/types';

import {
  getPermissionsSetters,
  MethodWithPermissions,
  PathWithPermissions,
} from './permissoins';

export type Props = {
  scope: Construct;
  api: HttpApi;
  auth: Auth;
  photos: Photos;
};

export const createRoutes = ({ scope, api, auth, photos }: Props) => {
  const apiEnvVars: AllEnvVars = {
    authDomain: auth.authDomain,
    clientId: auth.userPoolClient.userPoolClientId,
    loginCallbackUrl: auth.loginCallbackUrl,
    logoutCallbackUrl: auth.logoutCallbackUrl,
    logoutCallbackLocalhostUrl: auth.logoutCallbackLocalhostUrl,
    photoBucket: photos.bucket.bucketName,
  };

  const userPoolAuthorizer = new HttpUserPoolAuthorizer(
    'user-pool-authorizer',
    auth.userPool,
    { userPoolClients: [auth.userPoolClient] }
  );

  Object.entries(apiOptions).forEach(([path, { methods }]) => {
    Object.entries(methods).forEach(([method, methodOptions]) => {
      createRoute({
        scope,
        api,
        path,
        method,
        methodOptions,
        userPoolAuthorizer,
        apiEnvVars,
        permissionsSetter: getPermissionsSetters({ auth, photos })[
          path as PathWithPermissions
        ]?.[method as MethodWithPermissions],
      });
    });
  });
};

function createRoute({
  scope,
  api,
  path,
  method,
  methodOptions,
  userPoolAuthorizer,
  apiEnvVars,
  permissionsSetter,
}: Pick<Props, 'scope' | 'api'> & {
  path: string;
  method: string;
  methodOptions: ApiMethodOptions;
  userPoolAuthorizer: HttpUserPoolAuthorizer;
  apiEnvVars: AllEnvVars;
  permissionsSetter?: (fn: NodejsFunction) => void;
}) {
  const handlerEnvironment: Record<string, string> = {};
  const { isPublic, envVars = [] } = methodOptions;

  envVars.forEach((key) => {
    handlerEnvironment[key] = apiEnvVars[key as keyof AllEnvVars];
  });

  const id = `${capitalize(
    path.replaceAll(':/', '-').replaceAll('/', '-')
  )}--${capitalize(method)}`;

  const entryPath = path
    .substring(1)
    .split('/')
    .map((part) => (part.startsWith(':') ? ':param' : part))
    .join('/');

  const apiPath = `/${path
    .substring(1)
    .split('/')
    .map((part) => (part.startsWith(':') ? `{${part.substring(1)}}` : part))
    .join('/')}`;

  const entry = `${__dirname}/handlers/${entryPath}/${method.toLowerCase()}/${method.toLowerCase()}-${entryPath
    .replace('/:', ':')
    .replaceAll('/', '-')}.ts`;

  const functionName = `api-handler-${entryPath
    .replaceAll('/', '-')
    .replaceAll(':', '')}--${method}`;

  const handlerProps = methodOptions.handlerProps as NodejsFunctionProps;

  const handler = createNodejsFunction(scope, `Handler-${id}`, {
    entry,
    functionName,
    environment: handlerEnvironment,
    ...handlerProps,
    timeout: Duration.seconds((handlerProps?.timeout as unknown as number) || 30),
  });

  api.addRoutes({
    path: apiPath,
    methods: [method as HttpMethod],
    integration: new HttpLambdaIntegration(`Http-Integration-${id}`, handler),
    authorizer: isPublic ? undefined : userPoolAuthorizer,
  });

  if (permissionsSetter) {
    permissionsSetter(handler);
  }
}
