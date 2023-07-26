import { IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { Duration, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import {
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

import { Web, Zone } from '~/constructs';
import { createTable } from '~/constructs/utils';
import {
  apiPaths,
  apiSubdomain,
  appEnvs,
  appName,
  authSubdomain,
  idTokenValidityInDays,
  localhostUrl,
  refreshTokenValidityInDays,
  sessionsTableOptions,
  usersTableOptions,
} from '~/consts';
import { getCdkEnv } from '~/utils';

import { IdentityProviders } from './IdentityProviders';
import { UserPoolLambdaTriggers } from './UserPoolLambdaTriggers';

type Props = {
  zone: Zone;
  web: Web;
};

export class Auth extends NestedStack {
  public readonly sessionsTable: Table;

  public readonly usersTable: Table;

  public readonly identityPool: IdentityPool;

  public readonly userPool: UserPool;

  public readonly userPoolClient: UserPoolClient;

  public readonly authDomain: string;

  public readonly loginCallbackUrl: string;

  public readonly logoutCallbackUrl: string;

  public readonly logoutCallbackLocalhostUrl: string;

  constructor(scope: Construct, { zone, web }: Props) {
    super(scope, 'Auth');

    const envName = getCdkEnv();
    const { appDomain } = appEnvs[envName];
    const apiDomain = `${apiSubdomain}.${appDomain}`;

    this.usersTable = createTable(this, usersTableOptions);
    this.sessionsTable = createTable(this, sessionsTableOptions);
    this.authDomain = `${authSubdomain}.${appDomain}`;
    this.loginCallbackUrl = `https://${apiDomain}${apiPaths['login-callback']}`;
    this.logoutCallbackUrl = `https://${appDomain}`;
    this.logoutCallbackLocalhostUrl = localhostUrl;

    this.identityPool = new IdentityPool(this, 'Identity-Pool', {
      identityPoolName: `${appName}`,
      allowUnauthenticatedIdentities: true,
    });

    const { lambdaTriggers } = new UserPoolLambdaTriggers(
      this,
      'User-Pool-Lambda-Triggers',
      {
        triggers: ['postConfirmation', 'postAuthentication'],
        usersTable: this.usersTable,
      }
    );

    this.userPool = new UserPool(this, 'User-Pool', {
      lambdaTriggers,
      removalPolicy: RemovalPolicy.DESTROY,
      userPoolName: appName,
    });

    const identityProvidres = new IdentityProviders(
      this,
      'User-Pool-Identity-Providers',
      {
        userPool: this.userPool,
      }
    );

    const logoutUrls = [this.logoutCallbackUrl];

    if (envName === 'personal') {
      logoutUrls.push(this.logoutCallbackLocalhostUrl);
    }

    this.userPoolClient = new UserPoolClient(this, 'User-Pool-Client', {
      userPool: this.userPool,
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.APPLE,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        callbackUrls: [this.loginCallbackUrl],
        logoutUrls,
        flows: {
          authorizationCodeGrant: true,
        },
      },
      idTokenValidity: Duration.days(idTokenValidityInDays),
      refreshTokenValidity: Duration.days(refreshTokenValidityInDays),
    });

    this.userPoolClient.node.addDependency(identityProvidres);

    const userPoolDomain = this.userPool.addDomain('User-Pool-Domain', {
      customDomain: {
        domainName: this.authDomain,
        certificate: zone.certificate,
      },
    });

    userPoolDomain.node.addDependency(web);

    new ARecord(this, 'A-Record', {
      zone: zone.hostedZone,
      recordName: authSubdomain,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain)),
    });
  }
}
