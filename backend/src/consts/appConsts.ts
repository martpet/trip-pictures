import { localhostPort } from '~/../../shared/consts';

export const authSubdomain = 'auth';
export const localhostUrl = `http://localhost:${localhostPort}`;
export const healthCheckAlarmEmails = ['martin_petrov@me.com'];
export const prodAccountId = '766373560006';
export const stagingAccountId = '204115048155';
export const rootHostedZoneId = 'Z0207937145S41OBP9QS3';
export const stagingHostedZoneId = 'Z01791432G9JNVDM92SAJ';
export const devHostedZoneId = 'Z01228832S4EGTRIOWEIT';
export const devAccountServiceRoleArn = 'arn:aws:iam::020463219829:role/DevAccountServiceRole';
export const googleClientSecretParamName = '/oauth/google/client-secret';
export const googleClientIdProd = '276806659709-nbtr116utpr7ak4j43gfq7sfi0frtcra.apps.googleusercontent.com';
export const googleClientIdStaging = '276806659709-du1tv5u4juububcu61o1hn5mafc76b54.apps.googleusercontent.com';
export const googleClientIdDev = '276806659709-6lap8v4ekmsqqrdaosb3tmiq6j24fvgv.apps.googleusercontent.com';
export const appleTeamId = 'HJ6Q44MPBD';
export const appleClientIdDev = 'TripPicsWebsiteDev';
export const appleClientIdStaging = 'TripPicsWebsiteStaging';
export const appleClientIdProd = 'TripPicsWebsiteProd';
export const appleKeyIdDev = 'CWS2D262UY';
export const appleKeyIdStaging = 'CUBN8UAVWR';
export const appleKeyIdProd = '6U6N9CLL8X';
export const applePrivateKeyParamName = '/oauth/apple/key-secret';
export const refreshTokenValidityInDays = 365;
export const idTokenValidityInDays = 1; // max is 1 day
export const lambdaPayloadLimit = 6 * 1024 * 1024;
export const DDB_BATCHGET_MAX_SIZE = 100;
export const DDB_BATCHWRITE_MAX_SIZE = 25;