import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Entries } from 'type-fest';

import { Api, Auth, Maps, Photos, Web, Zone } from '~/constructs';
import { RootStackOutputs } from '~/types';

export class RootStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const zone = new Zone(this);
    const web = new Web(this, { zone });
    const auth = new Auth(this, { zone, web });
    const photos = new Photos(this);
    new Maps(this, { auth });
    new Api(this, { auth, zone, photos });

    const stackOutputs: RootStackOutputs = {
      WebBucketName: web.destinationBucket.bucketName,
      WebDistroId: web.distribution.distributionId,
      IdentityPoolId: auth.identityPool.identityPoolId,
    };

    (Object.entries(stackOutputs) as Entries<RootStackOutputs>).forEach(
      ([name, value]) => {
        new CfnOutput(this, name, { value });
      }
    );
  }
}
