import 'urlpattern-polyfill';

import {
  APIGatewayProxyHandlerV2,
  DynamoDBClient,
  DynamoDBDocumentClient,
  errorResponse,
  GetCommand,
  GetOnePhotoResponse,
  photosTableOptions,
  StatusCodes,
} from 'lambda-layer';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandlerV2<GetOnePhotoResponse> = async (event) => {
  const { fingerprint } = Object(event.pathParameters);

  const getCommand = new GetCommand({
    TableName: photosTableOptions.tableName,
    Key: { [photosTableOptions.partitionKey.name]: fingerprint },
  });

  const { Item } = await ddbDocClient.send(getCommand);

  if (!Item) {
    return errorResponse('565cca53ca', { statusCode: StatusCodes.NOT_FOUND });
  }

  return Item;
};
