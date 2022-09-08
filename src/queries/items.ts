import { FractalSdkWalletGetItemsResponse } from '@fractalwagmi/ts-api';
import { useQuery } from '@tanstack/react-query';
import { sdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import { useUser } from 'hooks';

enum ItemApiKey {
  GET_ITEMS = 'GET_ITEMS',
}

export const ItemApiKeys = {
  getItems: (userId: string | undefined) =>
    [ApiFeature.ITEMS, ItemApiKey.GET_ITEMS, userId] as const,
};

export const useGetItemsQuery = () => {
  const { data: user } = useUser();
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
  const result = (await sdkApiClient.v1.getWalletItems()).data;
  return result;
}
