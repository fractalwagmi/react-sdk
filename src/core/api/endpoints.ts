export enum Endpoint {
  GET_COINS = 'GET_COINS',
  GET_INFO = 'GET_INFO',
  GET_WALLET_ITEMS = 'GET_WALLET_ITEMS',
}

export const ENDPOINTS_THAT_REQUIRE_AUTHENTICATION = new Set<Endpoint>([
  Endpoint.GET_COINS,
  Endpoint.GET_INFO,
  Endpoint.GET_WALLET_ITEMS,
]);
