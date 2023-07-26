import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Fn, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { Auth, Photos, Zone } from '~/constructs';
import { apiSubdomain, appEnvs } from '~/consts';
import { getCdkEnv } from '~/utils';

import { createDistroBehaviors } from './endpoints/createDistroBehaviors';
import { createRoutes } from './endpoints/createRoutes';

type Props = {
  zone: Zone;
  auth: Auth;
  photos: Photos;
};

export class Api extends NestedStack {
  constructor(scope: Construct, { zone, auth, photos }: Props) {
    super(scope, 'Api');

    const envName = getCdkEnv();
    const { appDomain } = appEnvs[envName];
    const apiDomain = `${apiSubdomain}.${appDomain}`;
    const api = new HttpApi(this, 'http-api');
    const origin = new HttpOrigin(Fn.select(1, Fn.split('://', api.apiEndpoint)));

    const logBucket = new Bucket(this, 'Distro-Log-Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new Distribution(this, 'Distro', {
      defaultBehavior: { origin },
      domainNames: [apiDomain],
      certificate: zone.certificate,
      enableLogging: true,
      logIncludesCookies: true,
      logBucket,
    });

    createRoutes({ scope, api, auth, photos });

    createDistroBehaviors({
      scope,
      api,
      auth,
      distribution,
      origin,
    });

    new ARecord(this, 'A-Record', {
      zone: zone.hostedZone,
      recordName: apiSubdomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }
}
