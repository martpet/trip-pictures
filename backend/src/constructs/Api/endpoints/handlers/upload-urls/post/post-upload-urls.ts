import {
  APIGatewayProxyHandlerV2,
  createPhotoS3Key,
  createPresignedPost,
  EnvVars,
  errorResponse,
  getIdTokenPayload,
  maxPhotoUploadSize,
  PhotosTableItem,
  photosTableOptions,
  PostUploadUrlsRequest,
  PostUploadUrlsResponse,
  RouteHeaders,
  S3Client,
  StatusCodes,
} from 'lambda-layer';

import { ddbBatchGet } from '~/constructs/Api/utils';
import { IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG } from '~/constructs/Photos/consts';

const s3Client = new S3Client({});

const TAGGING = `<Tagging><TagSet><Tag><Key>${IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG}</Key><Value>false</Value></Tag></TagSet></Tagging>`;

export const handler: APIGatewayProxyHandlerV2<PostUploadUrlsResponse> = async (
  event
) => {
  const { authorization } = event.headers as RouteHeaders<'/settings'>;
  const { photoBucket } = process.env as EnvVars<'/upload-urls', 'POST'>;

  if (!authorization) {
    return errorResponse('Vf5Ph6qN1S');
  }

  if (!photoBucket) {
    return errorResponse('1rQkj3kpp4');
  }

  if (!event.body) {
    return errorResponse('G-luuHqI0s', { statusCode: StatusCodes.BAD_REQUEST });
  }

  let requestData;

  try {
    requestData = JSON.parse(event.body) as PostUploadUrlsRequest;
  } catch (error) {
    return errorResponse('9210145fdf', { statusCode: StatusCodes.BAD_REQUEST, error });
  }

  const existingItemsInDb = await ddbBatchGet<PhotosTableItem>({
    pkValues: requestData.map(({ fingerprint }) => fingerprint),
    tableOptions: photosTableOptions,
  });

  const existingFingerprintsInDb = existingItemsInDb.map(
    ({ fingerprint }) => fingerprint
  );

  const uniqueRequestData = requestData.filter(
    ({ fingerprint }) => !existingFingerprintsInDb.includes(fingerprint)
  );

  const { sub: userId } = await getIdTokenPayload(authorization);

  const uploadUrlsEntries = await Promise.all(
    uniqueRequestData.map(async ({ id, fingerprint, digest }) => {
      const key = createPhotoS3Key({ userId, fingerprint });
      const presignedPost = await createPresignedPost(s3Client, {
        Bucket: photoBucket,
        Key: key,
        Expires: 600,
        Fields: {
          'x-amz-checksum-algorithm': 'SHA256',
          'x-amz-checksum-sha256': digest,
          tagging: TAGGING,
        },
        Conditions: [
          ['content-length-range', 0, maxPhotoUploadSize],
          { tagging: TAGGING },
        ],
      });
      return [id, presignedPost];
    })
  );

  return {
    presignedPosts: Object.fromEntries(uploadUrlsEntries),
    existingFingerprintsInDb,
  };
};
