export interface PublicHookResponse<T> {
  data: T;
  error: unknown;
  refetch: () => void;
}
