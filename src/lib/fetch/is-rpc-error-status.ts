import { GoogleRpcStatus } from '@fractalwagmi/fractal-auth-api';
import { isNullOrUndefined } from 'lib/util/guards';

export const isRpcErrorStatus = (err: unknown): err is GoogleRpcStatus => {
  if (typeof err !== 'object') {
    return false;
  }
  if (err === null) {
    return false;
  }

  const asRpcStatus = err as GoogleRpcStatus;
  if (isNullOrUndefined(asRpcStatus.message)) {
    return false;
  }

  return true;
};
