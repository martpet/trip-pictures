import {
  createPhotoS3Key,
  DynamoDBRecord,
  DynamoDBStreamHandler,
  Merge,
  PhotosTableItem,
  PutObjectTaggingCommand,
  S3Client,
} from 'lambda-layer';

import {
  IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG,
  STREAM_HANDLER_PHOTO_BUCKET_ENV_KEY,
} from '../consts';

const s3Client = new S3Client({});

type PhotoRecord = Merge<
  DynamoDBRecord,
  { dynamodb: { NewImage: Record<keyof PhotosTableItem, { S: string }> } }
>;

export const handler: DynamoDBStreamHandler = async (event) => {
  const photoBucket = process.env[STREAM_HANDLER_PHOTO_BUCKET_ENV_KEY];

  const photosRecords = event.Records.filter(
    ({ dynamodb }) => dynamodb?.NewImage
  ) as PhotoRecord[];

  console.info('Pending items:', photosRecords.length);

  const promises = photosRecords.map(async ({ dynamodb }) => {
    const s3Key = createPhotoS3Key({
      fingerprint: dynamodb.NewImage.fingerprint.S,
      userId: dynamodb.NewImage.userId.S,
    });

    return s3Client.send(
      new PutObjectTaggingCommand({
        Bucket: photoBucket,
        Key: s3Key,
        Tagging: {
          TagSet: [{ Key: IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG, Value: 'true' }],
        },
      })
    );
  });

  await Promise.all(promises);
};
