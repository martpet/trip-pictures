import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { ddbScan, itCalls, itResolves } from '~/constructs/Api/utils';

import { handler } from '../get-photo-points';

vi.mock('~/constructs/Api/utils/ddbHelpers/ddbScan');

const ddbMock = mockClient(DynamoDBDocumentClient);

vi.mocked(ddbScan).mockResolvedValue([
  { fingerprint: 'c' },
  { fingerprint: 'a' },
  { fingerprint: 'b' },
]);

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(GetCommand).resolves({ Item: { dummyPhotoProp: 'dummyPhotoValue' } });
});

const args = [] as unknown as Parameters<typeof handler>;

describe('get-photo-points', () => {
  itCalls(ddbScan, handler, args);
  itResolves(handler, args);
});
