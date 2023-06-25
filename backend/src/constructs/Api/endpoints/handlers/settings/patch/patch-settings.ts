import {
  APIGatewayProxyHandlerV2,
  createDynamoUpdateExpression,
  DynamoDBClient,
  DynamoDBDocumentClient,
  errorResponse,
  getIdTokenPayload,
  PatchSettingsRequest,
  PatchSettingsResponse,
  RouteHeaders,
  StatusCodes,
  SyncedSettingsKey,
  syncedSettingsKeys,
  UpdateCommand,
  UsersTableItem,
  usersTableOptions,
} from 'lambda-layer';

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const settingsAttrName: keyof UsersTableItem = 'settings';
const allowedSettings = syncedSettingsKeys;

export const handler: APIGatewayProxyHandlerV2<PatchSettingsResponse> = async (event) => {
  const { authorization } = event.headers as RouteHeaders<'/settings'>;

  if (!authorization) {
    return errorResponse('UMxOJy1cpJ');
  }

  if (!event.body) {
    return errorResponse('x1IsNHbqd3', { statusCode: StatusCodes.BAD_REQUEST });
  }

  let patch;

  try {
    patch = JSON.parse(event.body) as PatchSettingsRequest;
  } catch (error) {
    return errorResponse('d6QTt6tKWK', { statusCode: StatusCodes.BAD_REQUEST, error });
  }

  const hasUnknownKeys = Object.keys(patch).some(
    (key) => !allowedSettings.includes(key as SyncedSettingsKey)
  );

  if (hasUnknownKeys) {
    return errorResponse('IUKROTi0UF', { statusCode: StatusCodes.BAD_REQUEST });
  }

  const { sub } = await getIdTokenPayload(authorization);

  const updateCommand = new UpdateCommand({
    TableName: usersTableOptions.tableName,
    Key: { [usersTableOptions.partitionKey.name]: sub },
    ...createDynamoUpdateExpression(patch, settingsAttrName),
  });

  await ddbDocClient.send(updateCommand);

  return {
    statusCode: StatusCodes.NO_CONTENT,
  };
};
