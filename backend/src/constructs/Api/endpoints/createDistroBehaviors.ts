import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Duration } from 'aws-cdk-lib';
import {
  AddBehaviorOptions,
  AllowedMethods,
  CacheCookieBehavior,
  CacheHeaderBehavior,
  CachePolicy,
  CachePolicyProps,
  CacheQueryStringBehavior,
  Distribution,
  experimental,
  LambdaEdgeEventType,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestPolicyProps,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { Writable } from 'type-fest';

import { Auth } from '~/constructs';
import { authorizationHeader } from '~/constructs/Api/consts';
import { apiOptions, appEnvs, appName, publicEndpoints } from '~/consts';
import { ApiOptions, ApiPath } from '~/types';
import { getAllowedOrigins, getCdkEnv } from '~/utils';

import { createAuthEdgeFunction } from './authEdgeFunction/createAuthEdgeFunction';
import { getSecurityHeadersBehavior } from './getSecurityHeadersBehavior';

type Props = {
  scope: Construct;
  api: HttpApi;
  origin: HttpOrigin;
  distribution: Distribution;
  auth: Auth;
};

export const createDistroBehaviors = ({ scope, auth, origin, distribution }: Props) => {
  const authEdgeFunction = createAuthEdgeFunction({ scope, auth });

  const defaultCachePolicyProps: CachePolicyProps = {
    cachePolicyName: `${appName}-Api-Default-Policy`,
    defaultTtl: Duration.seconds(1),
    minTtl: Duration.seconds(0),
    maxTtl: Duration.days(365),
    cookieBehavior: CacheCookieBehavior.none(),
    queryStringBehavior: CacheQueryStringBehavior.none(),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
  };

  const defaultCachePolicy = new CachePolicy(
    scope,
    'Default-Cache-Policy',
    defaultCachePolicyProps
  );

  (Object.keys(apiOptions) as ApiPath[]).forEach((path) => {
    addBehavior({
      scope,
      origin,
      distribution,
      authEdgeFunction,
      defaultCachePolicy,
      defaultCachePolicyProps,
      path,
    });
  });
};

function addBehavior({
  scope,
  origin,
  distribution,
  authEdgeFunction,
  defaultCachePolicy,
  defaultCachePolicyProps,
  path,
}: Pick<Props, 'scope' | 'origin' | 'distribution'> & {
  path: ApiPath;
  authEdgeFunction: experimental.EdgeFunction;
  defaultCachePolicy: CachePolicy;
  defaultCachePolicyProps: CachePolicyProps;
}) {
  const {
    methods,
    headers = [],
    cookies = [],
    queryStrings = [],
    cacheProps,
  } = (apiOptions as ApiOptions)[path];

  const formattedPath = path
    .toLowerCase()
    .split('/')
    .map((part) => (part.startsWith(':') ? 'param' : part))
    .join('-');
  const envName = getCdkEnv();
  const { appDomain } = appEnvs[envName];
  const customCachePolicyProps: Writable<CachePolicyProps> = {};
  const originRequestPolicyProps: Writable<OriginRequestPolicyProps> = {};

  const hasPrivateEndpoints =
    !publicEndpoints[path] ||
    publicEndpoints[path]?.length !== Object.keys(apiOptions[path].methods).length;

  const behaviorOptions: Writable<AddBehaviorOptions> = {
    edgeLambdas: [],
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: AllowedMethods.ALLOW_ALL,
    cachePolicy: defaultCachePolicy,
    responseHeadersPolicy: new ResponseHeadersPolicy(
      scope,
      `Response-Headers-Policy-${formattedPath}`,
      {
        responseHeadersPolicyName: `${appName}-Api-${formattedPath}`,
        securityHeadersBehavior: getSecurityHeadersBehavior({ envName, appDomain, path }),
        corsBehavior: {
          accessControlAllowCredentials: true,
          accessControlAllowHeaders: ['content-type'],
          accessControlAllowMethods: Object.keys(methods),
          accessControlAllowOrigins: getAllowedOrigins(),
          accessControlMaxAge: Duration.days(1),
          originOverride: true,
        },
      }
    ),
  };

  if (cacheProps) {
    const { minTtl, maxTtl, defaultTtl, ...rest } = cacheProps;
    Object.assign(customCachePolicyProps, rest);
    if (minTtl) customCachePolicyProps.minTtl = Duration.seconds(minTtl);
    if (maxTtl) customCachePolicyProps.maxTtl = Duration.seconds(maxTtl);
    if (defaultTtl) customCachePolicyProps.defaultTtl = Duration.seconds(defaultTtl);
  }

  if (hasPrivateEndpoints) {
    customCachePolicyProps.headerBehavior =
      CacheHeaderBehavior.allowList(authorizationHeader);

    behaviorOptions.edgeLambdas?.push({
      eventType: LambdaEdgeEventType.VIEWER_REQUEST,
      functionVersion: authEdgeFunction.currentVersion,
    });
  }

  if (headers.length) {
    originRequestPolicyProps.headerBehavior = OriginRequestHeaderBehavior.allowList(
      ...headers
    );
  }

  if (cookies.length) {
    originRequestPolicyProps.cookieBehavior = OriginRequestCookieBehavior.allowList(
      ...cookies
    );
  }

  if (queryStrings.length) {
    customCachePolicyProps.queryStringBehavior = CacheQueryStringBehavior.allowList(
      ...queryStrings
    );
  }

  if (Object.keys(customCachePolicyProps).length) {
    behaviorOptions.cachePolicy = new CachePolicy(
      scope,
      `Cache-Policy-${formattedPath}`,
      {
        ...defaultCachePolicyProps,
        ...customCachePolicyProps,
        cachePolicyName: `${appName}-Api-${formattedPath}`,
      }
    );
  }

  if (Object.keys(originRequestPolicyProps).length) {
    behaviorOptions.originRequestPolicy = new OriginRequestPolicy(
      scope,
      `Origin-Request-Policy-${formattedPath}`,
      {
        ...originRequestPolicyProps,
        originRequestPolicyName: `${appName}-Api-${formattedPath}`,
      }
    );
  }

  const pathPattern = path
    .split('/')
    .map((part) => (part.startsWith(':') ? '*' : part))
    .join('/');

  distribution.addBehavior(pathPattern, origin, behaviorOptions);
}
