import {
  BatchGetCommand,
  DDB_BATCHGET_MAX_SIZE,
  DynamoDBClient,
  DynamoDBDocument,
  TableOptions,
} from 'lambda-layer';

const ddbDocClient = DynamoDBDocument.from(new DynamoDBClient({}));

type Props = {
  tableOptions: TableOptions;
  pkValues: string[];
};

export const ddbBatchGet = async <TableItem>({ tableOptions, pkValues }: Props) => {
  const { tableName, partitionKey } = tableOptions;
  const requests = [];
  let result: TableItem[] = [];

  for (let i = 0; i < pkValues.length; i += DDB_BATCHGET_MAX_SIZE) {
    const chunk = pkValues.slice(i, i + DDB_BATCHGET_MAX_SIZE);
    const keys = chunk.map((pkValue) => ({ [partitionKey.name]: pkValue }));
    requests.push(get(keys));
  }

  async function get(Keys: Record<string, unknown>[]) {
    const input = { RequestItems: { [tableName]: { Keys } } };
    const command = new BatchGetCommand(input);
    const { Responses, UnprocessedKeys } = await ddbDocClient.send(command);
    const items = Responses?.[tableName] as TableItem[] | undefined;
    const nextKeys = UnprocessedKeys?.[tableName]?.Keys;

    if (items) result = result.concat(items);
    if (nextKeys) await get(nextKeys);
  }

  await Promise.all(requests);

  return result;
};
