import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { processCoins } from 'core/api/processors/coins';
import { useUser } from 'hooks/use-user';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const useCoins = () => {
  const { fractalUser } = useUser();
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
