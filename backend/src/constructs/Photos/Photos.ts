import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket, BucketEncryption, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { photosTableOptions } from 'lambda-layer';

import { OrphanedFilesCleanUp } from '~/constructs/Photos/OrphanedFilesCleanUp';
import { createTable } from '~/constructs/utils';
import { getAllowedOrigins, getCdkEnv } from '~/utils';

export class Photos extends NestedStack {
  public readonly bucket: Bucket;

  public readonly table: Table;

  constructor(scope: Construct) {
    super(scope, 'Photos');

    const envName = getCdkEnv();

    this.table = createTable(this, photosTableOptions);

    this.bucket = new Bucket(scope, 'Upload-Bucket', {
      cors: [
        {
          allowedMethods: [HttpMethods.POST],
          allowedOrigins: getAllowedOrigins(),
        },
      ],
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy:
        envName === 'production' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: envName === 'personal',
    });

    new OrphanedFilesCleanUp(this, {
      bucket: this.bucket,
      table: this.table,
    });
  }
}
