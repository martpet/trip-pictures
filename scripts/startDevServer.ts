import { spawn } from 'child_process';

import { getRootStackOutputs } from './getRootStackOutputs';

const { IdentityPoolId } = getRootStackOutputs();

spawn('vite', ['serve', 'frontend', ...process.argv], {
  env: {
    ...process.env,
    VITE_IDENTITY_POOL: IdentityPoolId,
  },
  stdio: 'inherit',
});
