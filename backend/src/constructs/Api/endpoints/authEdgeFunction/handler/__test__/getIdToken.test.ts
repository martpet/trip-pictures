import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import millis from 'milliseconds';

import { IdTokenPayload } from '~/constructs/Api/types';
import {
  getIdTokenPayload,
  itCalls,
  itRejects,
  itResolves,
  itSendsAwsCommand,
} from '~/constructs/Api/utils';

import { fetchNewIdToken } from '../fetchNewIdToken';
import { getIdToken } from '../getIdToken';

vi.mock('../fetchNewIdToken');
vi.mock('~/constructs/Api/utils/getIdTokenPayload');

const ddbMock = mockClient(DynamoDBDocumentClient);
const originalDate = Date.now();
const idTokenExpires = (Date.now() + millis.days(1)) / 1000;
const refreshTokenExpires = (Date.now() + millis.years(1)) / 1000;

const args = ['dummySessionId'] as Parameters<typeof getIdToken>;

vi.mocked(fetchNewIdToken).mockResolvedValue('newDummyIdToken');

vi.mocked(getIdTokenPayload).mockResolvedValue({
  exp: idTokenExpires,
  aud: 'dummyAud',
} as IdTokenPayload);

beforeEach(() => {
  ddbMock.reset();

  ddbMock.on(GetCommand).resolves({
    Item: {
      idToken: 'dummyIdToken',
      refreshToken: 'dummyRefreshToken',
      refreshTokenExpires,
    },
  });
});

describe('getTokens', () => {
  itSendsAwsCommand(GetCommand, ddbMock, getIdToken, args);
  itResolves(getIdToken, args);

  describe('when "Item" is missing from "GetCommand" output', () => {
    beforeEach(() => {
      ddbMock.on(GetCommand).resolves({});
    });
    itRejects(getIdToken, args);
  });

  describe('when "idToken" has expired', () => {
    beforeAll(() => {
      vi.setSystemTime(new Date(idTokenExpires * 1000 + millis.days(1)));
    });
    afterAll(() => {
      vi.setSystemTime(originalDate);
    });
    itCalls(fetchNewIdToken, getIdToken, args);
    itResolves(getIdToken, args);
  });

  describe('when "refreshToken" has expired', () => {
    beforeAll(() => {
      vi.setSystemTime(new Date(refreshTokenExpires * 1000 + millis.days(1)));
    });
    afterAll(() => {
      vi.setSystemTime(originalDate);
    });
    itRejects(getIdToken, args);
  });
});
