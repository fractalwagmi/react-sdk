import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { processCoins } from 'core/api/processors/coins';
import { PublicHookResponse } from 'hooks/public/types';
import { useUser } from 'hooks/public/use-user';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Coin } from 'types';

export const useCoins = (): PublicHookResponse<Coin[]> => {
  const { data: user } = useUser();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const requestKey = user
    ? [Endpoint.GET_COINS, user.accessToken, user.userId, fetchToken]
    : null;
  const { data, error } = useSWR(
    requestKey,
    async () =>
      (
        await sdkApiClient.v1.getCoins({
          headers: maybeIncludeAuthorizationHeaders(
            user?.accessToken ?? '',
            Endpoint.GET_COINS,
          ),
        })
      ).data,
  );

  const coins = useMemo(() => processCoins(data?.coins ?? []), [data?.coins]);

  return {
    data: coins,
    error,
    refetch,
  };
};
