import { Construct } from 'constructs';

import { Auth } from '~/constructs';
import { createEdgeFunction } from '~/constructs/utils';

declare global {
  var globalAuthEdgeFunctionProps: {
    authDomain: string;
  };
}

type Props = {
  scope: Construct;
  auth: Auth;
};

export const createAuthEdgeFunction = ({ scope, auth }: Props) => {
  const edgeFunction = createEdgeFunction(scope, 'Auth-Edge-Lambda', {
    entry: `${__dirname}/handler/authEdgeHandler.ts`,
    globalProps: {
      globalAuthEdgeFunctionProps: {
        authDomain: auth.authDomain,
      },
    },
  });

  auth.sessionsTable.grantReadData(edgeFunction);
  auth.sessionsTable.grantWriteData(edgeFunction);

  return edgeFunction;
};
