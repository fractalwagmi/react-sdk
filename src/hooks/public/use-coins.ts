import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { transformCoins } from 'core/api/transformers/coins';
import { FractalSDKError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';
import { PublicHookResponse } from 'hooks/public/types';
import { useUser } from 'hooks/public/use-user';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Coin } from 'types';

export const useCoins = (): PublicHookResponse<Coin[]> => {
  const { data: user } = useUser();
  const accessToken = maybeGetAccessToken();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const requestKey = user
    ? [Endpoint.GET_COINS, user.userId, fetchToken]
    : null;
  const { data, error: errorResponse } = useSWR(
    requestKey,
    async () =>
      (
        await sdkApiClient.v1.getCoins({
          headers: maybeIncludeAuthorizationHeaders(
            accessToken ?? '',
            Endpoint.GET_COINS,
          ),
        })
      ).data,
  );

  const coins = useMemo(() => transformCoins(data?.coins ?? []), [data?.coins]);

  let error: FractalSDKError | undefined;
  if (errorResponse) {
    // TODO(ENG-394): Enumerate possible errors.
    error = new FractalSDKError('Unable to retrieve coins');
  }

  return {
    data: coins,
    error,
    refetch,
  };
};
