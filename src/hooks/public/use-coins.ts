import { transformCoins } from 'core/api/transformers/coins';
import { FractalSDKError, FractalSDKGetCoinsUnknownError } from 'core/error';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useGetCoinsQuery } from 'queries/coins';
import { useCallback, useMemo } from 'react';
import { Coin } from 'types';

export const useCoins = (): PublicDataHookResponse<Coin[]> => {
  const {
    data,
    error: errorResponse,
    refetch: refetchQuery,
  } = useGetCoinsQuery();

  const refetch = useCallback(() => {
    refetchQuery();
  }, []);
  const coins = useMemo(() => transformCoins(data?.coins ?? []), [data?.coins]);

  let error: FractalSDKError | undefined;
  if (errorResponse && !(errorResponse instanceof FractalSDKError)) {
    error = new FractalSDKGetCoinsUnknownError(
      `Unable to retrieve coins err = ${errorResponse}`,
    );
  }

  return {
    data: coins,
    error,
    refetch,
  };
};
