import { appEnvs, localhostUrl } from '~/consts';
import { getCdkEnv } from '~/utils';

export const getAllowedOrigins = () => {
  const envName = getCdkEnv();
  const { appDomain } = appEnvs[envName];

  const origins = [`https://${appDomain}`];

  if (envName === 'personal') {
    origins.push(localhostUrl);
  }

  return origins;
};
