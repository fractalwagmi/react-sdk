import { HttpResponse } from '@fractalwagmi/fractal-auth-api';
import { isRpcErrorStatus } from 'lib/fetch/is-rpc-error-status';
import { isFalsy, isNullOrUndefined } from 'lib/util/guards';

export const isHttpResponse = <D, E>(
  res: unknown,
): res is HttpResponse<D, E> => {
  if (typeof res !== 'object') {
    return false;
  }
  if (res === null) {
    return false;
  }

  const asResponse = res as HttpResponse<D, E>;
  if (
    isFalsy(asResponse.status) ||
    !(asResponse.headers instanceof Headers) ||
    typeof asResponse.ok !== 'boolean' ||
    isNullOrUndefined(asResponse.statusText)
  ) {
    return false;
  }

  // If res.ok is false there should be an error present
  if (!asResponse.ok && !isRpcErrorStatus(asResponse.error)) {
    return false;
  }

  return true;
};
