import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { TableOptions } from 'aws-cdk-lib/aws-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { itResolves, itSendsAwsCommand } from '~/constructs/Api/utils';

import { ddbScan } from '../ddbScan';

vi.mock('~/constructs/Api/utils/errorResponse');

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();

  ddbMock.on(ScanCommand).resolves({ Items: [{ dummyItemKey: 'dummyItemValue' }] });
});

const tableOptions = {
  tableName: 'dummyTablename',
} as unknown as TableOptions;

const args = [
  {
    tableOptions,
    attributes: ['dummyAttr'],
  },
] as Parameters<typeof ddbScan>;

describe('ddbScan', () => {
  itSendsAwsCommand(ScanCommand, ddbMock, ddbScan, args);
  itResolves(ddbScan, args);

  describe('when "Items" is missing from "ScanCommand" output', () => {
    beforeEach(() => {
      ddbMock.on(ScanCommand).resolves({});
    });
    itResolves(ddbScan, args);
  });

  describe('when "LastEvaluatedKey" exists in "ScanCommand" output', () => {
    beforeEach(() => {
      ddbMock
        .on(ScanCommand)
        .resolvesOnce({
          Items: [{ dummyItemKey1: 'dummyItemValue1' }],
          LastEvaluatedKey: { lastKeyProp: 'lastKeyValue' },
        })
        .resolvesOnce({
          Items: [{ dummyItemKey2: 'dummyItemValue2' }],
        });
    });

    it('sends "ScanCommand" a second time with correct args', async () => {
      await ddbScan(...args);
      expect(ddbMock.commandCalls(ScanCommand)[1].args[0].input).toMatchSnapshot();
    });

    itResolves(ddbScan, args);
  });
});
