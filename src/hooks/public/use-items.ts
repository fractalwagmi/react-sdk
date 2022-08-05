import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { processItems } from 'core/api/processors/items';
import { PublicHookResponse } from 'hooks/public/types';
import { useUser } from 'hooks/public/use-user';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Item } from 'types';

export const useItems = (): PublicHookResponse<Item[]> => {
  const { data: user } = useUser();
  const [fetchToken, setFetchToken] = useState(0);

  const refetch = useCallback(() => {
    setFetchToken(fetchToken + 1);
  }, [fetchToken]);

  const { data, error } = useSWR(
    user ? [user.userId, user.accessToken, fetchToken] : null,
    async () =>
      (
        await sdkApiClient.v1.getWalletItems({
          headers: maybeIncludeAuthorizationHeaders(
            user?.accessToken ?? '',
            sdkApiClient.v1.getWalletItems,
          ),
        })
      ).data,
  );

  const items = useMemo(() => processItems(data?.items ?? []), [data?.items]);

  return {
    data: items,
    error,
    refetch,
  };
};
