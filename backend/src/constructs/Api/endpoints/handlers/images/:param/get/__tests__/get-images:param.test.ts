import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { lambdaPayloadLimit } from 'lambda-layer';

import {
  itCalls,
  itHasEnvVars,
  itHasPathParam,
  itResolves,
  itResolvesWithError,
  itSendsAwsCommand,
} from '~/constructs/Api/utils';

import { handler } from '../get-images:param';
import { processImage } from '../processImage';

vi.mock('../processImage');
vi.mock('~/constructs/Api/utils/errorResponse');

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

process.env.photoBucket = 'dummyPhotoBucketName';

const args = [
  {
    pathParameters: {
      fingerprint: 'dummyFingerprint',
    },
    queryStringParameters: {
      quality: '99',
      width: '888',
      height: '555',
    },
  },
] as unknown as Parameters<typeof handler>;

beforeEach(() => {
  ddbMock.reset();
  s3Mock.reset();

  ddbMock.on(GetCommand).resolves({
    Item: { userId: 'dummyUserId' },
  });

  s3Mock.on(GetObjectCommand).resolves({
    Body: 'dummyBody',
  } as unknown as GetObjectCommandOutput);
});

describe('get-images:param', () => {
  itHasEnvVars(['photoBucket'], handler, args);
  itHasPathParam('fingerprint', handler, args);
  itSendsAwsCommand(GetCommand, ddbMock, handler, args);
  itSendsAwsCommand(GetObjectCommand, s3Mock, handler, args);
  itCalls(processImage, handler, args);
  itResolves(handler, args);

  describe.each(['width', 'height', 'quality'])(
    'when "%s" query string parameter is missing',
    (key) => {
      const argsClone = structuredClone(args);
      const queryStrings = { ...args[0].queryStringParameters };
      delete queryStrings[key];
      argsClone[0].queryStringParameters = queryStrings;
      itCalls(processImage, handler, argsClone);
    }
  );

  describe('when "Item" is missing from "GetCommand" output', () => {
    beforeEach(() => {
      ddbMock.on(GetCommand).resolves({});
    });
    itResolvesWithError(handler, args);
  });

  describe('when "Body" is missing from "GetObjectCommand" output', () => {
    beforeEach(() => {
      s3Mock.on(GetObjectCommand).resolves({});
    });
    itResolvesWithError(handler, args);
  });

  describe('when "processImage" output length is bigger than lambda payload limit', () => {
    beforeEach(() => {
      vi.mocked(processImage).mockResolvedValue({
        length: lambdaPayloadLimit + 1,
      } as any);
    });
    itResolvesWithError(handler, args);
  });
});
