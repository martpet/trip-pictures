import { rootDomain } from '../consts/sharedConsts';

const subdomainKey = 'VITE_PERSONAL_SUBDOMAIN';

export const getPersonalDevDomain = (env: any) => {
  // @ts-ignore
  const isBrowser = typeof window !== 'undefined';
  const isBrowserEnvDev = env.DEV;
  const isPersonalCdkEnv = env.ENV_NAME === 'personal';
  const isTest = env.NODE_ENV === 'test';
  const subdomain = env[subdomainKey];

  if ((isBrowser && !isBrowserEnvDev) || (!isBrowser && !isTest && !isPersonalCdkEnv)) {
    return '';
  }

  if (!subdomain) {
    throw Error(`"${subdomainKey}" missing in .env.local`);
  }

  const sanitizedSubdomain = subdomain.replace(/_|-$|\.|\*|\\|\//gi, '');

  return `${sanitizedSubdomain}.dev.${rootDomain}`;
};
