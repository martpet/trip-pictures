import { edgeErrorResponse, itCalls, itResolves } from '~/constructs/Api/utils';
import { CallbackAndArgsTuple } from '~/types';

export function itResolvesWithEdgeError(...rest: CallbackAndArgsTuple) {
  const [handler, handlerArgs = []] = rest;
  itCalls(edgeErrorResponse, handler, handlerArgs);
  itResolves(handler, handlerArgs);
}
