import {
  BatchWriteCommand,
  DDB_BATCHWRITE_MAX_SIZE,
  DynamoDBClient,
  DynamoDBDocument,
  TableOptions,
} from 'lambda-layer';

const ddbDocClient = DynamoDBDocument.from(new DynamoDBClient({}));

type Props<TableItem> = {
  items: TableItem[];
  tableOptions: TableOptions;
};

export const ddbBatchWrite = async <TableItem extends Record<string, unknown>>({
  items,
  tableOptions,
}: Props<TableItem>) => {
  const { tableName } = tableOptions;
  const requests = [];

  for (let i = 0; i < items.length; i += DDB_BATCHWRITE_MAX_SIZE) {
    const chunk = items.slice(i, i + DDB_BATCHWRITE_MAX_SIZE);
    requests.push(write(chunk));
  }

  async function write(chunk: TableItem[]) {
    const RequestItems = { [tableName]: chunk.map((Item) => ({ PutRequest: { Item } })) };
    const command = new BatchWriteCommand({ RequestItems });
    const { UnprocessedItems } = await ddbDocClient.send(command);

    const nextChunk = UnprocessedItems?.[tableName]
      ?.filter(({ PutRequest }) => PutRequest?.Item)
      .map(({ PutRequest }) => PutRequest?.Item) as TableItem[] | undefined;

    if (nextChunk?.length) await write(nextChunk);
  }

  await Promise.all(requests);

  return items;
};
