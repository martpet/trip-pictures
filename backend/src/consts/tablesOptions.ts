import { AttributeType, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';

import {
  PhotosTableItem,
  SessionsTableItem,
  TableOptions,
  UsersTableItem,
} from '~/types';

export const usersTableOptions = {
  tableName: 'TP-users',
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  },
} satisfies TableOptions<UsersTableItem>;

export const sessionsTableOptions = {
  tableName: 'TP-sessions',
  timeToLiveAttribute: 'refreshTokenExpires',
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  },
  globalSecondaryIndexes: [
    {
      indexName: 'user-sessions',
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'created',
        type: AttributeType.NUMBER,
      },
    },
  ],
} satisfies TableOptions<SessionsTableItem>;

export const photosTableOptions = {
  tableName: 'TP-photos',
  partitionKey: {
    name: 'fingerprint',
    type: AttributeType.STRING,
  },
  stream: StreamViewType.NEW_IMAGE,
} satisfies TableOptions<PhotosTableItem>;
