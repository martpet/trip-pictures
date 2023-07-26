import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'; // Adds 40 kB to the build

import { api } from '~/app/services';
import { region } from '~/common/consts';
import { TemporaryAWSCredentials } from '~/common/types';

const cognitoCredentialProvider = fromCognitoIdentityPool({
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL,
  clientConfig: { region },
});

const awsCredentialsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAwsCredentials: builder.query<TemporaryAWSCredentials, void>({
      async queryFn() {
        const { accessKeyId, secretAccessKey, sessionToken, expiration } =
          await cognitoCredentialProvider();

        return {
          data: {
            access_key: accessKeyId,
            secret_key: secretAccessKey,
            session_token: sessionToken,
            expiration: expiration?.getTime(),
          },
        };
      },
    }),
  }),
});

export const { useGetAwsCredentialsQuery } = awsCredentialsApi;
export const { getAwsCredentials } = awsCredentialsApi.endpoints;
