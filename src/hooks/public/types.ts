import { FractalSDKError } from 'core/error';

export interface PublicDataHookResponse<T> {
  data: T;
  error: FractalSDKError | undefined;
  refetch: () => void;
}
