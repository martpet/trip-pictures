import fs from 'fs';

import { rootStackName, rootStackOutputKeys } from '../shared/consts';
import { RootStackOutputs } from '../shared/types';

const filePath = 'backend/outputs.json';

export function getRootStackOutputs() {
  let json;

  try {
    json = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    throw new Error(`"${filePath}" is missing. Run "npm deploy:dev" first.`);
  }

  const outputs = JSON.parse(json)[rootStackName];

  if (!isValid(outputs)) {
    throw new Error("'outputs.json' doesn't contain RootStackOutputs");
  }

  return outputs;
}

function isValid(object?: Object): object is RootStackOutputs {
  return (
    typeof object !== 'undefined' &&
    Object.entries(object).every(
      ([key, value]) =>
        rootStackOutputKeys.includes(key as keyof RootStackOutputs) &&
        typeof value !== 'undefined'
    )
  );
}
