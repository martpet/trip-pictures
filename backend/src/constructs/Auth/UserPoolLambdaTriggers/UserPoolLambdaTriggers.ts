import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { createNodejsFunction } from '~/constructs/utils';
import { capitalize } from '~/utils';

type TriggerName = 'postConfirmation' | 'postAuthentication';

type UserPoolLambdaTriggersProps = {
  triggers: TriggerName[];
  usersTable: Table;
};

export class UserPoolLambdaTriggers extends Construct {
  public readonly lambdaTriggers: Partial<Record<TriggerName, NodejsFunction>> = {};

  constructor(
    scope: Construct,
    id: string,
    { triggers, usersTable }: UserPoolLambdaTriggersProps
  ) {
    super(scope, id);

    triggers.forEach((triggerName) => {
      const fn = createNodejsFunction(this, capitalize(triggerName), {
        entry: `${__dirname}/lambda/${triggerName}/${triggerName}.ts`,
        functionName: `user-pool-event--${triggerName.toLowerCase()}`,
      });

      this.lambdaTriggers[triggerName] = fn;

      usersTable.grantReadWriteData(fn);
    });
  }
}
