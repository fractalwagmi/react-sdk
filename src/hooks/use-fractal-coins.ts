import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { processCoins } from 'core/api/processors/coins';
import { useFractalUser } from 'hooks/use-fractal-user';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const useFractalCoins = () => {
  const { fractalUser } = useFractalUser();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const { data, error } = useSWR(
    fractalUser ? [fractalUser.userId, fetchToken] : null,
    async () =>
      (
        await sdkApiClient.v1.getCoins({
          headers: maybeIncludeAuthorizationHeaders(
            fractalUser?.accessToken ?? '',
            sdkApiClient.v1.getCoins,
          ),
        })
      ).data,
  );

  return {
    error,
    fractalCoins: processCoins(data?.coins ?? []),
    refetch,
  };
};
