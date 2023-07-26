import { Signer } from '@aws-amplify/core/lib-esm/Signer';
import { Style } from 'mapbox-gl';

import { api } from '~/app/services';
import { apiPaths, region } from '~/common/consts';
import { GetPhotoPointsResponse, TemporaryAWSCredentials } from '~/common/types';

export const mapApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPoints: build.query<GetPhotoPointsResponse, void>({
      query: () => apiPaths['photo-points'],
    }),

    getStyleDescriptor: build.query<
      Style,
      { mapName: string; credentials: TemporaryAWSCredentials }
    >({
      async queryFn({ mapName, credentials }) {
        const url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor`;
        const signedUrl = Signer.signUrl(url, credentials);
        const res = await fetch(signedUrl);

        return {
          data: await res.json(),
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const { mapName } = queryArgs;
        return { mapName };
      },
    }),
  }),
});

export const { useGetPointsQuery, useGetStyleDescriptorQuery } = mapApi;
export const { getPoints } = mapApi.endpoints;
