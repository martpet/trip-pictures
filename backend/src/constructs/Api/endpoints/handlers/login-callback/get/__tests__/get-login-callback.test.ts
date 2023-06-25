import { describe } from 'vitest';

import { OauthCookieProps } from '~/constructs/Api/types';
import {
  itCalls,
  itHasEnvVars,
  itHasQueryStrings,
  itResolves,
  itResolvesWithError,
} from '~/constructs/Api/utils';
import { capitalize } from '~/utils';

import { dummyOauthTokens } from '../__mocks__/fetchTokens';
import { dummyOauthCookieProps } from '../__mocks__/parseOauthCookie';
import { createLoginCallbackScript } from '../createLoginCallbackScript';
import { createSession } from '../createSession';
import { fetchTokens } from '../fetchTokens';
import { handler } from '../get-login-callback';
import { parseOauthCookie } from '../parseOauthCookie';

vi.importMock('../createSession');

vi.mock('~/constructs/Api/utils/errorResponse');
vi.mock('../fetchTokens');
vi.mock('../parseOauthCookie');
vi.mock('../createSession');
vi.mock('../createLoginCallbackScript');

process.env.authDomain = 'dummyAuthDomain';
process.env.clientId = 'dummyClientId';
process.env.loginCallbackUrl = 'dummyLoginCallbackUrl';
process.env.envName = 'dummyEnvName';

const args = [
  {
    cookies: 'dummyCookies',
    queryStringParameters: {
      code: 'dummyCode',
      state: 'dummyState',
      error_description: 'dummyQueryStringErrorDescription',
    },
  },
] as unknown as Parameters<typeof handler>;

describe('"get-login-callback" handler', () => {
  itHasQueryStrings(['code', 'state'], handler, args);
  itHasEnvVars(['clientId', 'authDomain', 'loginCallbackUrl'], handler, args);
  itCalls(parseOauthCookie, handler, args);
  itCalls(fetchTokens, handler, args);
  itCalls(createSession, handler, args);
  itCalls(createLoginCallbackScript, handler, args);
  itResolves(handler, args);

  describe.each(['error'])('when "%s" query string parameter is present', (key) => {
    const argsClone = structuredClone(args);
    (argsClone[0] as Required<(typeof argsClone)[0]>).queryStringParameters[
      key
    ] = `dummyQueryString${capitalize(key)}`;
    itResolvesWithError(handler, argsClone);
  });

  describe.each(['stateNonce', 'idTokenNonce', 'codeVerifier'])(
    'when "oauth" cookie content is missing "%s" key',
    (key) => {
      const oauthCookiePropsClone = structuredClone(dummyOauthCookieProps);
      delete oauthCookiePropsClone[key as keyof OauthCookieProps];
      beforeEach(() => {
        vi.mocked(parseOauthCookie).mockReturnValueOnce(oauthCookiePropsClone);
      });
      itResolvesWithError(handler, args);
    }
  );

  describe('when "stateNonce" from "oauth" cookie does not match with "state" from query strings params', () => {
    const argsClone = structuredClone(args);
    const { queryStringParameters } = argsClone[0] as Required<(typeof argsClone)[0]>;
    queryStringParameters.state = 'differentState';
    itResolvesWithError(handler, argsClone);
  });

  describe('when "idTokenNonce" from "oauth" cookie does not match with "nonce" from the "idToken" payload', () => {
    const tokensPropsClone = structuredClone(dummyOauthTokens);
    tokensPropsClone.idTokenPayload.nonce = 'differentNonce';
    beforeEach(() => {
      vi.mocked(fetchTokens).mockResolvedValueOnce(tokensPropsClone);
    });
    itResolvesWithError(handler, args);
  });
});
