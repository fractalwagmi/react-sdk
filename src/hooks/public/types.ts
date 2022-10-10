import { FractalSDKError } from 'core/error';

export interface PublicDataHookResponse<T> {
  data: T | undefined;
  error: FractalSDKError | undefined;
  refetch: () => void;
}
