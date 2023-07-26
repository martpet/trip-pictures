import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { apiOptions, ApiPath } from 'lambda-layer';
import { RequireAtLeastOne } from 'type-fest';

import { Auth, Photos } from '~/constructs';

type PermissionsCallbacks = Partial<{
  [P in ApiPath]: RequireAtLeastOne<
    Record<keyof (typeof apiOptions)[P]['methods'], (fn: NodejsFunction) => void>
  >;
}>;

export type PathWithPermissions = keyof PermissionsCallbacks;
export type MethodWithPermissions = keyof PermissionsCallbacks[PathWithPermissions];

export type Props = {
  auth: Auth;
  photos: Photos;
};

export const getPermissionsSetters = ({ auth, photos }: Props): PermissionsCallbacks => ({
  '/login-callback': {
    GET: (f) => auth.sessionsTable.grantWriteData(f),
  },
  '/logout': {
    GET: (f) => auth.sessionsTable.grantWriteData(f),
  },
  '/me': {
    GET: (f) => auth.usersTable.grantReadData(f),
  },
  '/settings': {
    PATCH: (f) => auth.usersTable.grantWriteData(f),
  },
  '/upload-urls': {
    POST: (f) => {
      photos.bucket.grantPut(f);
      photos.table.grantReadData(f);
    },
  },
  '/photos': {
    POST: (f) => photos.table.grantReadWriteData(f),
  },
  '/photo-points': {
    GET: (f) => photos.table.grantReadData(f),
  },
  '/images/:fingerprint': {
    GET: (f) => {
      photos.bucket.grantReadWrite(f);
      photos.table.grantReadData(f);
      f.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['rekognition:DetectModerationLabels'],
          resources: ['*'],
        })
      );
    },
  },
});
