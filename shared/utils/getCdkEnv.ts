import { envNames } from '../consts/envNames';
import { EnvName } from '../types/EnvName';

export function getCdkEnv() {
  const envName = process.env.ENV_NAME as EnvName;
  const isValid = envNames.includes(envName);

  if (!isValid) {
    throw Error('"process.env.ENV_NAME" is invalid');
  }

  return envName;
}
