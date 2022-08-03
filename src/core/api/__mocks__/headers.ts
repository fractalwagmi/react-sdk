/**
 * Whenever `maybeIncludeAuthorizationHeaders` is being used in your
 * code-under-test, be sure to mock headers.ts:
 *
 *     jest.mock('/core/api/headers');
 *
 * This ensures that authorization headers are always attached. This is needed
 * because the provided 2nd argument reference is often a mock function which
 * essentially breaks the behavior of the real
 * `maybeIncludeAuthorizationHeaders` function.
 */
export const maybeIncludeAuthorizationHeaders = jest.fn();

maybeIncludeAuthorizationHeaders.mockImplementation(
  (accessToken: string, ignoreMethod: unknown, headers: HeadersInit) => {
    return {
      ...headers,
      authorization: `Bearer ${accessToken}`,
    };
  },
);
