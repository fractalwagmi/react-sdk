import {
  FractalSDKError,
  FractalSDKTransactionStatusFetchUnknownError,
} from 'core/error';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useGetTransactionStatusPollerQuery } from 'queries/transaction';
import { TransactionStatus } from 'types';

export const useTransactionStatus = (
  signature: string,
): Omit<PublicDataHookResponse<TransactionStatus>, 'refetch'> => {
  const { data: responseData, error: errorResponse } =
    useGetTransactionStatusPollerQuery(signature);

  let status = TransactionStatus.PENDING;

  switch (responseData?.confirmed?.success) {
    case true:
      status = TransactionStatus.SUCCESS;
      break;
    case false:
      status = TransactionStatus.FAIL;
      break;
  }

  let error: FractalSDKError | undefined;
  if (errorResponse && !(errorResponse instanceof FractalSDKError)) {
    error = new FractalSDKTransactionStatusFetchUnknownError(
      `Unable to retrieve transaction status. err = ${errorResponse}`,
    );
  }

  return {
    data: status,
    error: error,
  };
};
