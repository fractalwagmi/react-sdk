import {
  FractalSdkMarketplaceGetTokenBuyTransactionResponse,
  FractalSdkWalletGetItemsResponse,
} from '@fractalwagmi/ts-api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import {
  FractalSDKAuthenticationError,
  FractalSDKBuyItemUnknownError,
} from 'core/error';
import { FractalSDKGetItemsUnknownError } from 'core/error/item';
import { useUser } from 'hooks/public/use-user';
import { useUserWallet } from 'hooks/public/use-user-wallet';

enum ItemApiKey {
  GENERATE_BUY_TRANSACTION = 'GENERATE_BUY_TRANSACTION',
  GET_ITEMS = 'GET_ITEMS',
}

interface GenerateBuyTransactionParameters {
  quantity: number;
  tokenId: string;
  walletId: string;
}

export const ItemApiKeys = {
  generateBuyTransaction: ({
    quantity,
    tokenId,
    walletId,
  }: Partial<GenerateBuyTransactionParameters>) =>
    [
      ApiFeature.ITEMS,
      ItemApiKey.GENERATE_BUY_TRANSACTION,
      tokenId,
      walletId,
      quantity,
    ] as const,
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

export const useGenerateBuyTransactionMutation = () => {
  const { data: userWallet } = useUserWallet();
  return useMutation(
    async ({
      quantity,
      tokenId,
    }: Omit<GenerateBuyTransactionParameters, 'walletId'>) => {
      const walletId = userWallet?.solanaPublicKeys[0];
      if (!walletId) {
        throw new FractalSDKAuthenticationError(
          'Missing wallet address.' +
            `Expected a non-empty string but received ${walletId}`,
        );
      }
      return generateBuyTransaction({
        quantity,
        tokenId,
        walletId,
      });
    },
  );
};

const CoinApi = {
  generateBuyTransaction,
  getItems,
};

async function getItems(): Promise<FractalSdkWalletGetItemsResponse> {
  const response = await sdkApiClient.v1.getWalletItems();
  if (response.error) {
    throw new FractalSDKGetItemsUnknownError(
      `There was an issue fetching items. error = ${response.error.message}`,
    );
  }
  return response.data;
}

async function generateBuyTransaction({
  quantity,
  tokenId,
  walletId,
}: GenerateBuyTransactionParameters): Promise<FractalSdkMarketplaceGetTokenBuyTransactionResponse> {
  const response = await sdkApiClient.v1.tokenBuyTransaction({
    quantity,
    tokenId,
    walletId,
  });
  if (response.error) {
    throw new FractalSDKBuyItemUnknownError(
      `There was an issue generating the buy transaction. error = ${response.error.message}`,
    );
  }
  return response.data;
}
