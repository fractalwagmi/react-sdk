import { FractalWebsdkMarketplaceGetForSaleItemsResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import { isNotNullOrUndefined } from '@fractalwagmi/fractal-ts-lib';
import {
  FractalSdkMarketplaceGetTokenBuyTransactionResponse,
  FractalSdkMarketplaceGetTokenCancelSellTransactionResponse,
  FractalSdkMarketplaceGetTokenSellTransactionResponse,
  FractalSdkWalletGetItemsResponse,
} from '@fractalwagmi/ts-api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sdkApiClient, webSdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import {
  FractalSDKAuthenticationError,
  FractalSDKBuyItemUnknownError,
} from 'core/error';
import {
  FractalSDKGetItemsUnknownError,
  FractalSDKListItemUnknownError,
  FractalSDKCancelListItemUnknownError,
  FractalSDKGetItemsForSaleUnknownError,
} from 'core/error/item';
import { useUser } from 'hooks/public/use-user';
import { useUserWallet } from 'hooks/public/use-user-wallet';

enum ItemApiKey {
  GENERATE_BUY_TRANSACTION = 'GENERATE_BUY_TRANSACTION',
  GENERATE_LIST_TRANSACTION = 'GENERATE_LIST_TRANSACTION',
  GENERATE_CANCEL_LIST_TRANSACTION = 'GENERATE_CANCEL_LIST_TRANSACTION',
  GET_ITEMS = 'GET_ITEMS',
  GET_ITEMS_FOR_SALE = 'GET_ITEMS_FOR_SALE',
}

export interface GetItemsForSaleParams {
  limit?: number | undefined;
  sortDirection?: 'ASCENDING' | 'DESCENDING';
  sortField?: 'LIST_TIME' | 'PRICE';
}

interface GenerateBuyTransactionParameters {
  quantity: number;
  tokenId: string;
  walletId: string;
}

interface GenerateListTransactionParameters {
  price: string;
  quantity?: number;
  tokenId: string;
  walletId: string;
}

interface GenerateCancelListTransactionParameters {
  quantity: number;
  tokenId: string;
  walletId: string;
}

export const ItemApiKeys = {
  getItems: (userId: string | undefined) =>
    [ApiFeature.ITEMS, ItemApiKey.GET_ITEMS, userId] as const,
  getItemsForSale: (
    { limit, sortDirection, sortField }: GetItemsForSaleParams,
    userId: string | undefined,
  ) =>
    [
      ApiFeature.ITEMS,
      ItemApiKey.GET_ITEMS_FOR_SALE,
      limit,
      sortDirection,
      sortField,
      // We use the `userId` as a key to ensure react query invalidates the
      // cache whenever the user logs out.
      userId,
    ] as const,
};

export const useGetItemsQuery = () => {
  const { data: user } = useUser();
  const query = useQuery(
    ItemApiKeys.getItems(user?.userId),
    async () => CoinApi.getItems(),
    {
      enabled: isNotNullOrUndefined(user),
    },
  );

  if (user === undefined) {
    query.remove();
  }

  return query;
};

export const useGetItemsForSaleQuery = (params: GetItemsForSaleParams) => {
  const { data: user } = useUser();
  const query = useQuery(
    ItemApiKeys.getItemsForSale(params, user?.userId),
    async () => CoinApi.getItemsForSale(params),
    {
      // We require a user to be logged in to make this call because the API
      // requires an API access token.
      enabled: isNotNullOrUndefined(user),
    },
  );

  if (user === undefined) {
    query.remove();
  }

  return query;
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
      return CoinApi.generateBuyTransaction({
        quantity,
        tokenId,
        walletId,
      });
    },
  );
};

export const useGenerateListTransactionMutation = () => {
  const { data: userWallet } = useUserWallet();
  return useMutation(
    async ({
      price,
      quantity,
      tokenId,
    }: Omit<GenerateListTransactionParameters, 'walletId'>) => {
      const walletId = userWallet?.solanaPublicKeys[0];
      if (!walletId) {
        throw new FractalSDKAuthenticationError(
          'Missing wallet address.' +
            `Expected a non-empty string but received ${walletId}`,
        );
      }
      return CoinApi.generateListTransaction({
        price,
        quantity,
        tokenId,
        walletId,
      });
    },
  );
};

export const useGenerateCancelListTransactionMutation = () => {
  const { data: userWallet } = useUserWallet();
  return useMutation(
    async ({
      quantity,
      tokenId,
    }: Omit<GenerateCancelListTransactionParameters, 'walletId'>) => {
      const walletId = userWallet?.solanaPublicKeys[0];
      if (!walletId) {
        throw new FractalSDKAuthenticationError(
          'Missing wallet address.' +
            `Expected a non-empty string but received ${walletId}`,
        );
      }
      return CoinApi.generateCancelListTransaction({
        quantity,
        tokenId,
        walletId,
      });
    },
  );
};

const CoinApi = {
  generateBuyTransaction,
  generateCancelListTransaction,
  generateListTransaction,
  getItems,
  getItemsForSale,
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

async function getItemsForSale({
  limit,
  sortDirection,
  sortField,
}: GetItemsForSaleParams): Promise<FractalWebsdkMarketplaceGetForSaleItemsResponse> {
  const response = await webSdkApiClient.websdk.getForSaleItems({
    /* eslint-disable @typescript-eslint/naming-convention */
    limit,
    'sort.direction': sortDirection,
    'sort.field': sortField,
    /* eslint-enable @typescript-eslint/naming-convention */
  });
  if (response.error) {
    throw new FractalSDKGetItemsForSaleUnknownError(
      `There was an issue fetching items for sale. error = ${response.error.message}`,
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

async function generateListTransaction({
  price,
  quantity = 1,
  tokenId,
  walletId,
}: GenerateListTransactionParameters): Promise<FractalSdkMarketplaceGetTokenSellTransactionResponse> {
  const response = await sdkApiClient.v1.tokenSellTransaction({
    price,
    quantity,
    tokenId,
    walletId,
  });
  if (response.error) {
    throw new FractalSDKListItemUnknownError(
      `There was an issue generating the list transaction. error = ${response.error.message}`,
    );
  }
  return response.data;
}

async function generateCancelListTransaction({
  quantity = 1,
  tokenId,
  walletId,
}: GenerateCancelListTransactionParameters): Promise<FractalSdkMarketplaceGetTokenCancelSellTransactionResponse> {
  const response = await sdkApiClient.v1.tokenCancelSellTransaction({
    quantity,
    tokenId,
    walletId,
  });
  if (response.error) {
    throw new FractalSDKCancelListItemUnknownError(
      `There was an issue generating the cancel list transaction. error = ${response.error.message}`,
    );
  }
  return response.data;
}
