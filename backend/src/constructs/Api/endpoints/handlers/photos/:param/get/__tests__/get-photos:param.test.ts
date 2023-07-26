import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import {
  itResolves,
  itResolvesWithError,
  itSendsAwsCommand,
} from '~/constructs/Api/utils';

import { handler } from '../get-photos:param';

vi.mock('~/constructs/Api/utils/errorResponse');

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(GetCommand).resolves({ Item: { dummyPhotoProp: 'dummyPhotoValue' } });
});

const args = [
  { pathParameters: { fingerprint: 'dummyFingerprint' } },
] as unknown as Parameters<typeof handler>;

describe('get-photos:param', () => {
  itSendsAwsCommand(GetCommand, ddbMock, handler, args);
  itResolves(handler, args);

  describe('when "Item" is missing from "GetCommand" output', () => {
    beforeEach(() => {
      ddbMock.on(GetCommand).resolves({});
    });
    itResolvesWithError(handler, args);
  });
});
