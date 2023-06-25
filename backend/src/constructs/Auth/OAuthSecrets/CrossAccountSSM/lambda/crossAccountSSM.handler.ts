import {
  CloudFormationCustomResourceEvent,
  GetParametersCommand,
  GetParametersCommandInput,
  getRoleCredentials,
  Parameter,
  SetRequired,
  SSMClient,
} from 'lambda-layer';

export type ResourceProps = {
  roleArn: string;
  getParametersInput: GetParametersCommandInput;
};

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const { roleArn, getParametersInput } =
    event.ResourceProperties as unknown as ResourceProps;

  const inputParametersNames = getParametersInput.Names;

  if (!inputParametersNames) {
    throw Error('Missing input parameters names');
  }

  const credentials = await getRoleCredentials(roleArn, 'cross-account-ssm');
  const ssmClient = new SSMClient({ credentials });

  const { Parameters: outputParameters } = await ssmClient.send(
    new GetParametersCommand(getParametersInput)
  );

  const validateParameters = (
    parameters?: Parameter[]
  ): parameters is Array<SetRequired<Parameter, 'Name' | 'Value'>> => {
    return parameters !== undefined && parameters.every((p) => p.Name && p.Value);
  };

  if (!validateParameters(outputParameters)) {
    throw Error('Invalid SSM parameters');
  }

  outputParameters.sort(
    (paramA, paramB) =>
      inputParametersNames.indexOf(paramA.Name) -
      inputParametersNames.indexOf(paramB.Name)
  );

  return {
    Data: {
      values: outputParameters.map(({ Value }) => Value),
    },
  };
};
