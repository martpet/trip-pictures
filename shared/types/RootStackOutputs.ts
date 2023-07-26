import { rootStackOutputKeys } from '../consts/rootStackOutputKeys';

export interface RootStackOutputs
  extends Record<(typeof rootStackOutputKeys)[number], string> {}
