import {
  APIGatewayProxyHandlerV2,
  GetPhotoPointsResponse,
  PhotosTableItem,
  photosTableOptions,
} from 'lambda-layer';

import { ddbScan } from '~/constructs/Api/utils';

export const handler: APIGatewayProxyHandlerV2<GetPhotoPointsResponse> = async () => {
  const items = await ddbScan<Pick<PhotosTableItem, 'fingerprint'>>({
    tableOptions: photosTableOptions,
    attributes: ['fingerprint'],
  });

  return items.sort((a, b) => b.fingerprint.localeCompare(a.fingerprint));
};
