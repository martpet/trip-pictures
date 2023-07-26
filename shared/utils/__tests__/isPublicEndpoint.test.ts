import { isPublicEndpoint } from '../isPublicEndpoint';

describe('isPublicEndpoint', () => {
  it('returns a correct value', () => {
    expect(isPublicEndpoint({ path: '/me', method: 'GET' })).toBeFalsy();
    expect(isPublicEndpoint({ path: '/photo-points', method: 'GET' })).toBeTruthy();
    expect(isPublicEndpoint({ path: '/photos/123', method: 'GET' })).toBeTruthy();
  });
});
