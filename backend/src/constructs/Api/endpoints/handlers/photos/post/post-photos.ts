import {
  APIGatewayProxyHandlerV2,
  errorResponse,
  getIdTokenPayload,
  PhotosTableItem,
  photosTableOptions,
  PostPhotosRequest,
  PostPhotosResponse,
  RouteHeaders,
  StatusCodes,
} from 'lambda-layer';

import { ddbBatchGet, ddbBatchWrite } from '~/constructs/Api/utils';

export const handler: APIGatewayProxyHandlerV2<PostPhotosResponse> = async (event) => {
  const { authorization } = event.headers as RouteHeaders<'/settings'>;
  let requestData;

  if (!authorization) {
    return errorResponse('f31e4f94d3');
  }

  if (!event.body) {
    return errorResponse('24d59e00da', { statusCode: StatusCodes.BAD_REQUEST });
  }

  try {
    requestData = JSON.parse(event.body) as PostPhotosRequest;
  } catch (error) {
    return errorResponse('d45458a241', { statusCode: StatusCodes.BAD_REQUEST, error });
  }

  const existingItemsInDb = await ddbBatchGet<PhotosTableItem>({
    tableOptions: photosTableOptions,
    pkValues: requestData.map(({ fingerprint }) => fingerprint),
  });

  if (existingItemsInDb.length) {
    return errorResponse('9082bdd5f9', {
      statusCode: StatusCodes.FORBIDDEN,
      description: 'Cannot replace existing item',
    });
  }

  const { sub: userId } = await getIdTokenPayload(authorization);
  const createdAt = Date.now();

  return ddbBatchWrite({
    items: requestData.map((data) => ({ ...data, userId, createdAt })),
    tableOptions: photosTableOptions,
  });
};
