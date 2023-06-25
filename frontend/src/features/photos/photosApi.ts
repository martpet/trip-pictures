import { api } from '~/app/services';
import { apiPaths } from '~/common/consts';
import {
  PostPhotosRequest,
  PostPhotosResponse,
  UplaodableFileMeta,
} from '~/common/types';
import { mapApi } from '~/features/map/mapApi';

const photosApi = api.injectEndpoints({
  endpoints: (build) => ({
    createPhotos: build.mutation<PostPhotosResponse, UplaodableFileMeta[]>({
      query(filesMeta) {
        const body: PostPhotosRequest = filesMeta.map(({ fingerprint, exif }) => ({
          fingerprint,
          ...exif,
        }));
        return {
          url: apiPaths.photos,
          method: 'POST',
          body,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          mapApi.util.updateQueryData('getPoints', undefined, (draft) =>
            draft.concat(data)
          )
        );
      },
    }),
  }),
});

export const { createPhotos } = photosApi.endpoints;
