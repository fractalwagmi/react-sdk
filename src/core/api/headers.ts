import {
  ENDPOINTS_THAT_REQUIRE_AUTHENTICATION,
  sdkApiClient,
} from 'core/api/client';
import { ValueOf } from 'types/util';

/**
 * Maybe includes the authorization header in the `headers` input. If `headers`
 * is not provided, this function creates an empty object to use as `headers`.
 *
 * Inclusion of the authorization header is determined by whether `method` is
 * inside of the `ENDPOINTS_THAT_REQUIRE_AUTHORIZATION` set. When calling a new
 * SDK API endpoint, you'll need to allowlist the endpoint by adding to the set.
 *
 * For example, if we need to call `sdkApiClient.v1.getCoins`:
 *
 * 1. Add the method reference to `ENDPOINTS_THAT_REQUIRE_AUTHORIZATION`
 * 2. Then this method can be called like so:
 *
 *        maybeIncludeAuthorizationHeader(
 *          'my-access-token',
 *          sdkApiClient.v1.getCoins,
 *          { other: 'headers' },
 *        );
 */
export function maybeIncludeAuthorizationHeaders(
  accessToken: string,
  method: ValueOf<typeof sdkApiClient.v1>,
  headers: HeadersInit = {},
): HeadersInit {
  if (!ENDPOINTS_THAT_REQUIRE_AUTHENTICATION.has(method)) {
    return headers;
  }

  return {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  };
}
