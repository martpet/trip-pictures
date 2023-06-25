import { App } from 'aws-cdk-lib';

import { RootStack } from '~/constructs';
import { appEnvs, rootStackName } from '~/consts';
import { checkLocalEnvVars, getCdkEnv } from '~/utils';

const app = new App();
const envName = getCdkEnv();
const { env } = appEnvs[envName];

checkLocalEnvVars(envName);

new RootStack(app, rootStackName, { env });
