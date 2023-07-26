import { Duration, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import {
  CachePolicy,
  Distribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { Zone } from '~/constructs';
import { appEnvs, appName } from '~/consts';
import { getCdkEnv } from '~/utils';

type Props = {
  zone: Zone;
};

export class Web extends NestedStack {
  public readonly distribution: Distribution;

  public readonly destinationBucket: Bucket;

  constructor(scope: Construct, { zone }: Props) {
    super(scope, 'Web');

    const envName = getCdkEnv();
    const { appDomain } = appEnvs[envName];
    const { certificate, hostedZone } = zone;

    this.destinationBucket = new Bucket(this, 'Frontend-Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const logBucket = new Bucket(this, 'Distro-Log-Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.distribution = new Distribution(this, 'Distro', {
      defaultBehavior: {
        origin: new S3Origin(this.destinationBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new CachePolicy(this, 'Distro-Cache-Policy', {
          cachePolicyName: `${appName}-Web`,
          minTtl: Duration.days(365),
          enableAcceptEncodingBrotli: true,
          enableAcceptEncodingGzip: true,
        }),
      },
      defaultRootObject: 'index.html',
      domainNames: [appDomain],
      certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: `/index.html`,
        },
      ],
      enableLogging: true,
      logIncludesCookies: true,
      logBucket,
    });

    new ARecord(this, 'A-Record', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    });
  }
}
