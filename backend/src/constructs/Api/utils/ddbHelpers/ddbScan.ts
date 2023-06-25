import {
  DynamoDBClient,
  DynamoDBDocumentClient,
  ScanCommand,
  TableOptions,
} from 'lambda-layer';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type Props<ResultItem> = {
  tableOptions: TableOptions;
  attributes: (keyof ResultItem)[];
};

export async function ddbScan<ResultItem>({
  tableOptions,
  attributes,
}: Props<ResultItem>) {
  let items: ResultItem[] = [];

  const scan = async (ExclusiveStartKey?: Record<string, unknown>) => {
    const command = new ScanCommand({
      TableName: tableOptions.tableName,
      ExclusiveStartKey,
      ProjectionExpression: attributes.join(','),
    });

    const { Items, LastEvaluatedKey } = await ddbDocClient.send(command);

    if (Items) {
      items = items.concat(Items as typeof items);
    }

    if (LastEvaluatedKey) {
      await scan(LastEvaluatedKey);
    }
  };

  await scan();

  return items;
}
