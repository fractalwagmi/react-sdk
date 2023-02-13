import { trasnformForSaleItems } from 'core/api/transformers/items';
import {
  FractalSDKError,
  FractalSDKGetItemsForSaleUnknownError,
} from 'core/error';
import { PublicDataHookResponse } from 'hooks/public/types';
import { GetItemsForSaleParams, useGetItemsForSaleQuery } from 'queries/items';
import { useCallback, useMemo } from 'react';
import { ForSaleItem } from 'types';

/**
 * Fetches the list of for-sale items on the Fractal marketplace. Only returns
 * items belonging to the project as determined by the `clientId` passed into
 * the sdk provider.
 *
 * - `limit` defaults to 10.
 * - `sortDirection` defaults to 'DESCENDING'.
 * - `sortField` defaults to 'LIST_TIME'.
 */
export const useItemsForSale = ({
  limit = 10,
  sortDirection = 'DESCENDING',
  sortField = 'LIST_TIME',
}: GetItemsForSaleParams = {}): PublicDataHookResponse<ForSaleItem[]> => {
  const {
    data,
    error: errorResponse,
    refetch: refetchQuery,
  } = useGetItemsForSaleQuery({
    limit,
    sortDirection,
    sortField,
  });
  const refetch = useCallback(() => {
    refetchQuery();
  }, [refetchQuery]);
  const items = useMemo(
    () =>
      data?.items === undefined ? undefined : trasnformForSaleItems(data.items),
    [data?.items],
  );

  let error: FractalSDKError | undefined;
  if (errorResponse && !(errorResponse instanceof FractalSDKError)) {
    error = new FractalSDKGetItemsForSaleUnknownError(
      `Unable to retrieve items err = ${errorResponse}`,
    );
  }

  return {
    data: items,
    error,
    refetch,
  };
};
