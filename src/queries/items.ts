import { FractalSdkWalletGetItemsResponse } from '@fractalwagmi/ts-api';
import { useQuery } from '@tanstack/react-query';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { ApiFeature } from 'core/api/types';
import { FractalSDKAuthenticationError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';
import { useContext } from 'react';

enum ItemApiKey {
  GET_ITEMS = 'GET_ITEMS',
}

export const ItemApiKeys = {
  getItems: (userId: string | undefined) =>
    [ApiFeature.ITEMS, ItemApiKey.GET_ITEMS, userId] as const,
};

export const useGetItemsQuery = () => {
  const { user } = useContext(FractalSDKContext);
  return useQuery(
    ItemApiKeys.getItems(user?.userId),
    async () => CoinApi.getItems(),
    {
      enabled: user !== undefined,
    },
  );
};

const CoinApi = {
  getItems,
};

async function getItems(): Promise<FractalSdkWalletGetItemsResponse> {
  // TODO: Update to throw a FractalSDKError instance instead of throwing
  // anything.

  const accessToken = maybeGetAccessToken();
  if (!accessToken) {
    // TODO: Update this to reset the user (sign out) instead of throwing an
    // error.
    throw new FractalSDKAuthenticationError('Missing access token');
  }
  return (
    // TODO: Update to use securityWorker.
    (
      await sdkApiClient.v1.getWalletItems({
        headers: maybeIncludeAuthorizationHeaders(
          accessToken ?? '',
          Endpoint.GET_WALLET_ITEMS,
        ),
      })
    ).data
  );
}
