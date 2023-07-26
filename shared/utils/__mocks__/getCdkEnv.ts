import { EnvName } from '../../types/EnvName';

const envName: EnvName = 'production';

export const getCdkEnv = vi.fn().mockName('getCdkEnv').mockReturnValue(envName);
