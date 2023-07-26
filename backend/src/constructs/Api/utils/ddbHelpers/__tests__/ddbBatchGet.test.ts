import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { itResolves, itSendsAwsCommand } from '~/constructs/Api/utils';
import { DDB_BATCHGET_MAX_SIZE } from '~/consts';

import { ddbBatchGet } from '../ddbBatchGet';

const ddbMock = mockClient(DynamoDBDocumentClient);

const tableOptions = {
  tableName: 'dummyTableName',
  partitionKey: { name: 'dummyPartitionKeyName' },
};

const args = [
  {
    tableOptions,
    pkValues: ['dummyPkValue'],
  },
] as Parameters<typeof ddbBatchGet>;

beforeEach(() => {
  ddbMock.reset();

  ddbMock.on(BatchGetCommand).resolves({
    Responses: {
      [tableOptions.tableName]: [{ dummyResponseKey: 'dummyResponseValue' }],
    },
  });
});

describe('ddbBatchGet', () => {
  itSendsAwsCommand(BatchGetCommand, ddbMock, ddbBatchGet, args);
  itResolves(ddbBatchGet, args);

  describe(`when called with ${DDB_BATCHGET_MAX_SIZE + 1} items`, () => {
    const argsClone = structuredClone(args);
    argsClone[0].pkValues = Array(DDB_BATCHGET_MAX_SIZE + 1);

    it('sends "BatchGetCommand" 2 times', async () => {
      await ddbBatchGet(...argsClone);
      expect(ddbMock.commandCalls(BatchGetCommand).length).toBe(2);
    });
  });

  describe('when "BatchGetCommand" response is missing "Responses"', () => {
    beforeEach(() => {
      ddbMock.on(BatchGetCommand).resolves({});
    });
    itResolves(ddbBatchGet, args);
  });

  describe('when "BatchGetCommand" response has "UnprocessedKeys"', () => {
    beforeEach(() => {
      ddbMock
        .on(BatchGetCommand)
        .resolvesOnce({
          Responses: {
            [tableOptions.tableName]: [{ dummyResponseKey: 'dummyResponseValue1' }],
          },
          UnprocessedKeys: {
            [tableOptions.tableName]: {
              Keys: [{ dummyUnprocessedKeyProp: 'dummyUnprocessedKeyValue' }],
            },
          },
        })
        .resolvesOnce({
          Responses: {
            [tableOptions.tableName]: [{ dummyResponseKey: 'dummyResponseValue2' }],
          },
        });
    });

    it('sends "BatchGetCommand" a second time with correct args', async () => {
      await ddbBatchGet(...args);
      expect(ddbMock.commandCalls(BatchGetCommand)[1].args[0].input).toMatchSnapshot();
    });

    itResolves(ddbBatchGet, args);
  });
});
