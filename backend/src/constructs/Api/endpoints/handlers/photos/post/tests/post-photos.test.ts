import {
  ddbBatchGet,
  ddbBatchWrite,
  itCalls,
  itGetsIdToken,
  itHasJsonBody,
  itResolves,
  itResolvesWithError,
} from '~/constructs/Api/utils';

import { handler } from '../post-photos';

vi.mock('~/constructs/Api/utils/errorResponse');
vi.mock('~/constructs/Api/utils/getIdTokenPayload');
vi.mock('~/constructs/Api/utils/ddbHelpers/ddbBatchGet');
vi.mock('~/constructs/Api/utils/ddbHelpers/ddbBatchWrite');

beforeEach(() => {
  vi.mocked(ddbBatchGet).mockResolvedValue([]);
});

const args = [
  {
    headers: { authorization: 'dummyAuthorizationHeader' },
    body: JSON.stringify([{ fingerprint: 'dummyFingerprint1' }]),
  },
] as unknown as Parameters<typeof handler>;

describe('post-photos', () => {
  itHasJsonBody(handler, args);
  itGetsIdToken(handler, args);
  itCalls(ddbBatchGet, handler, args);
  itCalls(ddbBatchWrite, handler, args);
  itResolves(handler, args);

  describe('when "ddbBatchGet" has results', () => {
    beforeEach(() => {
      vi.mocked(ddbBatchGet).mockResolvedValue([{ fingerprint: 'dummyFingerPrint' }]);
    });
    itResolvesWithError(handler, args);
  });
});
