import { transformItems } from 'core/api/transformers/items';
import { FractalSDKError, FractalSDKGetItemsUnknownError } from 'core/error';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useGetItemsQuery } from 'queries/items';
import { useCallback, useMemo } from 'react';
import { Item } from 'types';

export const useItems = (): PublicDataHookResponse<Item[]> => {
  const {
    data,
    error: errorResponse,
    refetch: refetchQuery,
  } = useGetItemsQuery();

  const refetch = useCallback(() => {
    refetchQuery();
  }, [refetchQuery]);
  const items = useMemo(
    () => (data?.items === undefined ? undefined : transformItems(data.items)),
    [data?.items],
  );

  let error: FractalSDKError | undefined;
  if (errorResponse && !(errorResponse instanceof FractalSDKError)) {
    error = new FractalSDKGetItemsUnknownError(
      `Unable to retrieve items err = ${errorResponse}`,
    );
  }

  return {
    data: items,
    error,
    refetch,
  };
};
