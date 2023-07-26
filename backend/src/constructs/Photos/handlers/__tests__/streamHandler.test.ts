import { PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

import {
  itCalls,
  itRejects,
  itResolves,
  itSendsAwsCommand,
} from '~/constructs/Api/utils';
import { createPhotoS3Key } from '~/utils';

import { handler } from '../streamHandler';

vi.mock('~/utils/createPhotoS3Key');

const s3Mock = mockClient(S3Client);

process.env.photoBucket = 'dummyPhotoBucketName';

beforeEach(() => {
  s3Mock.reset();

  s3Mock.on(PutObjectTaggingCommand).resolves({});
});

const args = [
  {
    Records: [
      {
        dynamodb: {
          NewImage: {
            fingerprint: { S: 'dummyFingerPrint1' },
            userId: { S: 'dummyUserId1' },
          },
        },
      },
      {
        dynamodb: {
          NewImage: {
            fingerprint: { S: 'dummyFingerPrint2' },
            userId: { S: 'dummyUserId2' },
          },
        },
      },
    ],
  },
] as unknown as Parameters<typeof handler>;

describe('streamHandler', () => {
  itCalls(createPhotoS3Key, handler, args);
  itSendsAwsCommand(PutObjectTaggingCommand, s3Mock, handler, args);
  itResolves(handler, args);

  describe('when PutObjectTaggingCommand returns a rejected promise', () => {
    beforeEach(() => {
      s3Mock
        .on(PutObjectTaggingCommand)
        .rejectsOnce('dummy PutObjectTaggingCommand error');
    });
    itRejects(handler, args);
  });
});
