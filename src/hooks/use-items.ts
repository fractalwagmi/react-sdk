import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { processItems } from 'core/api/processors/items';
import { useUser } from 'hooks/use-user';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

export const useItems = () => {
  const { fractalUser } = useUser();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const { data, error } = useSWR(
    fractalUser ? [fractalUser.userId, fetchToken] : null,
    async () =>
      (
        await sdkApiClient.v1.getWalletItems({
          headers: maybeIncludeAuthorizationHeaders(
            fractalUser?.accessToken ?? '',
            sdkApiClient.v1.getWalletItems,
          ),
        })
      ).data,
  );

  return {
    error,
    fractalItems: processItems(data?.items ?? []),
    refetch,
  };
};
