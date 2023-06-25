import { itCalls, itReturns } from '~/constructs/Api/utils';
import { getAllowedOrigins, getCdkEnv } from '~/utils';

vi.mock('~/../../shared/utils/getCdkEnv');

describe('getAllowedOrigins', () => {
  itCalls(getCdkEnv, getAllowedOrigins);
  itReturns(getAllowedOrigins);

  describe('when the environment is "personal', () => {
    beforeEach(() => {
      vi.mocked(getCdkEnv).mockReturnValueOnce('personal');
    });
    itReturns(getAllowedOrigins);
  });
});
