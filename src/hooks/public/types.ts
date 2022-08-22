import { FractalError } from 'core/error';

export interface PublicHookResponse<T> {
  data: T;
  error: FractalError | undefined;
  refetch: () => void;
}
