import { aws_location as location, NestedStack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnMap } from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';

import { Auth } from '~/constructs';
import { appEnvs, localhostUrl, mapsOptions } from '~/consts';
import { getCdkEnv } from '~/utils';

type Props = {
  auth: Auth;
};

export class Maps extends NestedStack {
  constructor(scope: Construct, { auth }: Props) {
    super(scope, 'Maps');

    const envName = getCdkEnv();
    const { appDomain } = appEnvs[envName];
    const cfnMaps: CfnMap[] = [];

    Object.values(mapsOptions).forEach(({ style, mapName }) => {
      cfnMaps.push(
        new location.CfnMap(this, `Map-${style}`, {
          configuration: { style },
          mapName,
        })
      );
    });

    const policyReferers = [`https://${appDomain}/*`];

    if (envName === 'personal') {
      policyReferers.push(`${localhostUrl}/*`);
    }

    auth.identityPool.unauthenticatedRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['geo:GetMap*'],
        resources: cfnMaps.map(({ attrArn }) => attrArn),
        conditions: {
          StringLike: { 'aws:referer': policyReferers },
        },
      })
    );
  }
}
