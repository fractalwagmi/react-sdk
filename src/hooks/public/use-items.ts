import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { transformItems } from 'core/api/transformers/items';
import { FractalSDKError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useUser } from 'hooks/public/use-user';
import { createCacheToken } from 'lib/util/cache-token';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Item } from 'types';

export const useItems = (): PublicDataHookResponse<Item[]> => {
  const { data: user } = useUser();
  const accessToken = maybeGetAccessToken();
  const [cacheToken, setCacheToken] = useState(createCacheToken());

  const refetch = useCallback(() => {
    setCacheToken(createCacheToken());
  }, []);

  const getWalletItemsCacheKey = user
    ? [Endpoint.GET_WALLET_ITEMS, user.userId, cacheToken]
    : null;

  const { data, error: responseError } = useSWR(
    getWalletItemsCacheKey,
    async () =>
      (
        await sdkApiClient.v1.getWalletItems({
          headers: maybeIncludeAuthorizationHeaders(
            accessToken ?? '',
            Endpoint.GET_WALLET_ITEMS,
          ),
        })
      ).data,
  );

  const items = useMemo(() => transformItems(data?.items ?? []), [data?.items]);

  let error: FractalSDKError | undefined;
  if (responseError) {
    // TODO(ENG-394): Enumerate possible errors.
    error = new FractalSDKError('Unable to retrieve coins');
  }
  return {
    data: items,
    error,
    refetch,
  };
};
