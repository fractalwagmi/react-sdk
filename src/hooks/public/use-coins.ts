import { transformCoins } from 'core/api/transformers/coins';
import { FractalSDKError } from 'core/error';
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
