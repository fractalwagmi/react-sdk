import { FractalSDKError } from 'core/error';

export interface PublicHookResponse<T> {
  data: T;
  error: FractalSDKError | undefined;
  refetch: () => void;
}
