import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { itResolves, itSendsAwsCommand } from '~/constructs/Api/utils';
import { DDB_BATCHWRITE_MAX_SIZE } from '~/consts';
import { TableOptions } from '~/types';

import { ddbBatchWrite } from '../ddbBatchWrite';

const ddbMock = mockClient(DynamoDBDocumentClient);

const tableOptions = { tableName: 'dummyTableName' } as unknown as TableOptions;

const args = [
  {
    items: [{ dummyItemKey: 'dummyItemValue' }],
    tableOptions,
  },
] as Parameters<typeof ddbBatchWrite>;

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(BatchWriteCommand).resolves({});
});

describe('ddbBatchWrite', () => {
  itSendsAwsCommand(BatchWriteCommand, ddbMock, ddbBatchWrite, args);
  itResolves(ddbBatchWrite, args);

  describe(`when called with ${DDB_BATCHWRITE_MAX_SIZE + 1} items`, () => {
    const argsClone = structuredClone(args);
    argsClone[0].items = Array(DDB_BATCHWRITE_MAX_SIZE + 1);

    it('sends "BatchWriteCommand" 2 times', async () => {
      await ddbBatchWrite(...argsClone);
      expect(ddbMock.commandCalls(BatchWriteCommand).length).toBe(2);
    });
  });

  describe('when "BatchWriteCommand" response has "UnprocessedItems"', () => {
    beforeEach(() => {
      ddbMock
        .on(BatchWriteCommand)
        .resolvesOnce({
          UnprocessedItems: {
            [tableOptions.tableName]: [
              {
                PutRequest: {
                  Item: { dummyUnprocessedItemKey: 'dummyUnprocessedItemValue' },
                },
              },
            ],
          },
        })
        .resolvesOnce({});
    });

    it('sends "BatchWriteCommand" a second time with correct args', async () => {
      await ddbBatchWrite(...args);
      expect(ddbMock.commandCalls(BatchWriteCommand)[1].args[0].input).toMatchSnapshot();
    });
  });
});
