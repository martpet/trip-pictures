import { Signer } from '@aws-amplify/core/lib-esm/Signer';
import { RequestParameters } from 'maplibre-gl';
import { useCallback, useEffect, useRef } from 'react';

import { useGetAwsCredentialsQuery } from '~/app';
import { AWS_MAPS_HOSTNAME_REGEXP } from '~/common/consts';
import { TemporaryAWSCredentials } from '~/common/types';

export function useMapRequestTransformer() {
  const { data: credentials } = useGetAwsCredentialsQuery();
  const credentialsRef = useRef<TemporaryAWSCredentials>();

  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  const requestTransformer = useCallback((origUrl: string): RequestParameters => {
    let url = origUrl;

    if (AWS_MAPS_HOSTNAME_REGEXP.test(url)) {
      url = Signer.signUrl(url, credentialsRef.current);
    }

    return { url };
  }, []);

  return credentialsRef.current ? requestTransformer : undefined;
}
