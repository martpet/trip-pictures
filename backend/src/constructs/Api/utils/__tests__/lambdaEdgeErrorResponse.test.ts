import {
  edgeErrorResponse,
  errorResponse,
  itCalls,
  itReturns,
} from '~/constructs/Api/utils';

vi.mock('../errorResponse');

const args = ['dummyArg1', 'dummyArg2'] as unknown as Parameters<
  typeof edgeErrorResponse
>;

vi.mocked(errorResponse).mockReturnValue({
  statusCode: 418,
  body: 'dummyErrorResponseBody',
});

describe('edgeErrorResponse', () => {
  itCalls(errorResponse, edgeErrorResponse, args);
  itReturns(edgeErrorResponse, args);
});
