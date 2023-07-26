import {
  APIGatewayProxyHandlerV2,
  ApiQueryStrings,
  appEnvs,
  EnvVars,
  errorResponse,
  StatusCodes,
} from 'lambda-layer';

import { createLoginCallbackScript } from './createLoginCallbackScript';
import { createSession } from './createSession';
import { fetchTokens } from './fetchTokens';
import { parseOauthCookie } from './parseOauthCookie';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { envName } = globalLambdaProps;
  const { appDomain } = appEnvs[envName];
  const { script: responseScript } = createLoginCallbackScript({ envName, appDomain });

  const {
    state,
    code,
    error: queryStringError,
    error_description: queryStringErrorDescrption,
  } = Object(event.queryStringParameters) as ApiQueryStrings<'/login-callback'>;

  const { clientId, authDomain, loginCallbackUrl } = process.env as EnvVars<
    '/login-callback',
    'GET'
  >;

  const { stateNonce, idTokenNonce, codeVerifier } = parseOauthCookie(event);

  if (queryStringError) {
    return errorResponse('5vR4w3wVJs', {
      error: `${queryStringError}: ${queryStringErrorDescrption}`,
    });
  }

  if (!state || !code) {
    return errorResponse('1cByWITGGHw', { statusCode: StatusCodes.BAD_REQUEST });
  }

  if (!clientId || !authDomain || !loginCallbackUrl) {
    return errorResponse('XuJRO7_43O');
  }

  if (!stateNonce || !idTokenNonce || !codeVerifier) {
    return errorResponse('OSUiwUI_DG');
  }

  if (state !== stateNonce) {
    return errorResponse('eWe87M5edc', { statusCode: StatusCodes.UNAUTHORIZED });
  }

  const tokens = await fetchTokens({
    code,
    codeVerifier,
    clientId,
    authDomain,
    loginCallbackUrl,
  });

  if (tokens.idTokenPayload.nonce !== idTokenNonce) {
    return errorResponse('C25fjaal7o', { statusCode: StatusCodes.UNAUTHORIZED });
  }

  const sessionCookie = await createSession({ tokens });

  return {
    statusCode: StatusCodes.OK,
    cookies: [sessionCookie],
    headers: { 'Content-Type': 'text/html' },
    body: `<script>${responseScript}</script>`, // [todo] Add "Please wait" visuals
  };
};
