import { Endpoint } from 'core/api/endpoints';

export const ENDPOINTS_THAT_REQUIRE_AUTHENTICATION = new Set<Endpoint>([
  Endpoint.GET_COINS,
  Endpoint.GET_INFO,
  Endpoint.GET_WALLET_ITEMS,
]);

/**
 * Maybe includes the authorization header in the `headers` input. If `headers`
 * is not provided, this function creates an empty object to use as `headers`.
 *
 * Inclusion of the authorization header is determined by whether `endpoint` is
 * inside of the `ENDPOINTS_THAT_REQUIRE_AUTHORIZATION` set. When calling a new
 * SDK API endpoint, you'll need to allowlist the endpoint by adding to the set.
 */
export function maybeIncludeAuthorizationHeaders(
  accessToken: string,
  endpoint: Endpoint,
  headers: HeadersInit = {},
): HeadersInit {
  if (!ENDPOINTS_THAT_REQUIRE_AUTHENTICATION.has(endpoint)) {
    return headers;
  }

  return {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  };
}
