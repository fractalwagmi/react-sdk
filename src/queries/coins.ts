import { FractalSdkWalletGetCoinsResponse } from '@fractalwagmi/ts-api';
import { useQuery } from '@tanstack/react-query';
import { sdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import { useUser } from 'hooks';

enum CoinApiKey {
  GET_COINS = 'GET_COINS',
}

export const CoinApiKeys = {
  getCoins: (userId: string | undefined) =>
    [ApiFeature.COINS, CoinApiKey.GET_COINS, userId] as const,
};

export const useGetCoinsQuery = () => {
  const { data: user } = useUser();
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
  return (await sdkApiClient.v1.getCoins()).data;
}
