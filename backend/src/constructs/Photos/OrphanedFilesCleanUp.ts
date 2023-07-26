import { Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { FilterCriteria, FilterRule, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { createNodejsFunction } from '~/constructs/utils';

import {
  IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG,
  STREAM_HANDLER_PHOTO_BUCKET_ENV_KEY,
} from './consts';

type Props = {
  table: Table;
  bucket: Bucket;
};

export class OrphanedFilesCleanUp extends Construct {
  constructor(scope: Construct, { table, bucket }: Props) {
    super(scope, 'OrphanedFilesCleanUp');

    bucket.addLifecycleRule({
      tagFilters: { [IS_PHOTOS_TABLE_ITEM_CREATED_S3_TAG]: 'false' },
      expiration: Duration.days(1),
    });

    const streamHandler = createNodejsFunction(this, 'Stream-Handler', {
      entry: `${__dirname}/handlers/streamHandler.ts`,
      functionName: 'Photos-Db-Stream-Handler',
      timeout: Duration.seconds(60),
      memorySize: 512,
      environment: {
        [STREAM_HANDLER_PHOTO_BUCKET_ENV_KEY]: bucket.bucketName,
      },
    });

    streamHandler.addEventSource(
      new DynamoEventSource(table, {
        filters: [FilterCriteria.filter({ eventName: FilterRule.isEqual('INSERT') })],
        startingPosition: StartingPosition.LATEST,
        maxBatchingWindow: Duration.minutes(5),
        bisectBatchOnError: true,
        batchSize: 100,
        retryAttempts: 10,
      })
    );

    table.grantStreamRead(streamHandler);
    bucket.grantPut(streamHandler);
  }
}
