import {
  AttributeType,
  GlobalSecondaryIndexProps,
  TableProps,
} from 'aws-cdk-lib/aws-dynamodb';
import { Merge } from 'type-fest';

type Attr<T> = {
  [K in keyof T]?: {
    name: K;
    type: T[K] extends string
      ? AttributeType.STRING
      : T[K] extends number
      ? AttributeType.NUMBER
      : never;
  };
}[keyof T];

export type TableOptions<T = any> = TableProps & {
  tableName: `TP-${string}`;
  partitionKey: Attr<T>;
  sortKey?: Attr<T>;
  timeToLiveAttribute?: keyof T;
  globalSecondaryIndexes?: Array<
    Merge<
      GlobalSecondaryIndexProps,
      {
        partitionKey: Attr<T>;
        sortKey?: Attr<T>;
      }
    >
  >;
};
