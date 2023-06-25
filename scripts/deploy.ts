import { spawnSync } from 'child_process';

import { getCdkEnv } from '../shared/utils';
import { getRootStackOutputs } from './getRootStackOutputs';

const { AWS_PROFILE } = process.env;
const envName = getCdkEnv();

function run(...args: Parameters<typeof spawnSync>) {
  const argsClone = [...args] as typeof args;
  argsClone[2] ??= {};
  argsClone[2].stdio = 'inherit';
  const { status } = spawnSync(...argsClone);
  if (status !== 0) {
    throw new Error();
  }
}

console.info(`Deploying to ${envName}...`);

run(
  'npx',
  [
    'cdk',
    'deploy',
    '--all',
    '--require-approval=never',
    '--outputs-file=outputs.json',
    ...(AWS_PROFILE ? [`--profile=${AWS_PROFILE}`] : []),
  ],
  {
    cwd: './backend',
    env: process.env,
  }
);

const { WebBucketName, WebDistroId, IdentityPoolId } = getRootStackOutputs();

run('npm', ['run', 'build'], {
  env: {
    ...process.env,
    VITE_IDENTITY_POOL: IdentityPoolId,
  },
});

run(
  'aws',
  [
    's3',
    'sync',
    'frontend/dist',
    `s3://${WebBucketName}`,
    ...(AWS_PROFILE ? [`--profile=${AWS_PROFILE}`] : []),
  ],
  {
    env: process.env,
  }
);

run(
  'aws',
  [
    'cloudfront',
    'create-invalidation',
    `--distribution-id=${WebDistroId}`,
    '--paths=/*',
    ...(AWS_PROFILE ? [`--profile=${AWS_PROFILE}`] : []),
  ],
  {
    env: process.env,
  }
);
