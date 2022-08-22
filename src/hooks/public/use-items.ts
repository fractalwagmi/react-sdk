import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { transformItems } from 'core/api/transformers/items';
import { FractalError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';
import { PublicHookResponse } from 'hooks/public/types';
import { useUser } from 'hooks/public/use-user';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Item } from 'types';

export const useItems = (): PublicHookResponse<Item[]> => {
  const { data: user } = useUser();
  const accessToken = maybeGetAccessToken();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const requestKey = user
    ? [Endpoint.GET_WALLET_ITEMS, user.userId, fetchToken]
    : null;

  const { data, error: responseError } = useSWR(
    requestKey,
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

  let error: FractalError | undefined;
  if (responseError) {
    // TODO(ENG-394): Enumerate possible errors.
    error = new FractalError('Unable to retrieve coins');
  }
  return {
    data: items,
    error,
    refetch,
  };
};
