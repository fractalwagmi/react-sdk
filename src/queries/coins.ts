import { FractalSdkWalletGetCoinsResponse } from '@fractalwagmi/ts-api';
import { useQuery } from '@tanstack/react-query';
import { sdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import { FractalSDKGetCoinsUnknownError } from 'core/error';
import { useUser } from 'hooks/public/use-user';

enum CoinApiKey {
  GET_COINS = 'GET_COINS',
}

export const CoinApiKeys = {
  getCoins: (userId: string | undefined) =>
    [ApiFeature.COINS, CoinApiKey.GET_COINS, userId] as const,
};

export const useGetCoinsQuery = () => {
  const { data: user } = useUser();
  const query = useQuery(
    CoinApiKeys.getCoins(user?.userId),
    async () => CoinApi.getCoins(),
    {
      enabled: user !== undefined,
    },
  );

  if (user === undefined) {
    query.remove();
  }

  return query;
};

const CoinApi = {
  getCoins,
};

async function getCoins(): Promise<FractalSdkWalletGetCoinsResponse> {
  const response = await sdkApiClient.v1.getCoins();
  if (response.error) {
    throw new FractalSDKGetCoinsUnknownError(
      `There was an error fetching coins. err = ${response.error.message}`,
    );
  }
  return response.data;
}
