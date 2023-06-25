import { TypeScriptCode } from '@mrgrain/cdk-esbuild';
import { experimental } from 'aws-cdk-lib/aws-cloudfront';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { DefaultGlobalLambdaProps, GlobalLambdaProps } from '~/types';
import { getCdkEnv, objectValuesToJson } from '~/utils';

// [Todo] change to 18 when supported by EdgeLambda:
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-at-edge-runtime-restrictions

// [Note] Can't use lambda layer in eu-west-1 -- edge stack needs `crossRegionReferences`:
// "Cross stack references are only supported for stacks deployed to the same environment or between nested stacks and their parent stack. Set crossRegionReferences=true to enable cross region references"

type CreateEdgeFunctionProps = Partial<experimental.EdgeFunctionProps> & {
  entry: string;
  globalProps?: GlobalLambdaProps;
};

export const createEdgeFunction = (
  scope: Construct,
  id: string,
  { globalProps, entry, functionName, ...props }: CreateEdgeFunctionProps
) => {
  const defaultGlobalProps: DefaultGlobalLambdaProps = {
    globalLambdaProps: {
      envName: getCdkEnv(),
    },
  };
  const fileName = entry.split('/').at(-1)?.split('.ts')[0];

  return new experimental.EdgeFunction(scope, id, {
    handler: `${fileName}.handler`,
    runtime: Runtime.NODEJS_16_X,
    ...props,
    code: new TypeScriptCode(entry, {
      buildOptions: {
        minify: true,
        sourcemap: false,
        define: objectValuesToJson({
          ...defaultGlobalProps,
          ...globalProps,
        }),
      },
    }),
  });
};
