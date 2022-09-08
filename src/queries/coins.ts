import { FractalSdkWalletGetCoinsResponse } from '@fractalwagmi/ts-api';
import { useQuery } from '@tanstack/react-query';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { ApiFeature } from 'core/api/types';
import { FractalSDKAuthenticationError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';
import { useContext } from 'react';

enum CoinApiKey {
  GET_COINS = 'GET_COINS',
}

export const CoinApiKeys = {
  getCoins: (userId: string | undefined) =>
    [ApiFeature.COINS, CoinApiKey.GET_COINS, userId] as const,
};

export const useGetCoinsQuery = () => {
  const { user } = useContext(FractalSDKContext);
  return useQuery(
    CoinApiKeys.getCoins(user?.userId),
    async () => CoinApi.getCoins(),
    {
      enabled: user !== undefined,
    },
  );
};

const CoinApi = {
  getCoins,
};

async function getCoins(): Promise<FractalSdkWalletGetCoinsResponse> {
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
      await sdkApiClient.v1.getCoins({
        headers: maybeIncludeAuthorizationHeaders(
          accessToken,
          Endpoint.GET_COINS,
        ),
      })
    ).data
  );
}
