import {
  FractalSDKError,
  FractalSDKTransactionStatusFetchUnknownError,
} from 'core/error';
import { useTransactionStatusPoller } from 'queries/transaction';
import { useCallback } from 'react';
import { TransactionStatus } from 'types';

/**
 * @returns A callback that resolves to either `TransactionStatus.SUCCESS` or
 *   `TransactionStatus.FAIL`.
 *
 *   Note: This callback will wait for the transaction to either succeed or fail,
 *   so it will not receive the `TransactionStatus.PENDING` state.
 */
export const useWaitForTransactionStatus = (): {
  waitForTransactionStatus: (signature: string) => Promise<TransactionStatus>;
} => {
  const pollForTransactionStatus = useTransactionStatusPoller();
  const waitForTransactionStatus = useCallback(async (signature: string) => {
    try {
      const success = await pollForTransactionStatus(signature);
      if (success) {
        return TransactionStatus.SUCCESS;
      }
      return TransactionStatus.FAIL;
    } catch (err: unknown) {
      if (err instanceof FractalSDKError) {
        throw err;
      }
      throw new FractalSDKTransactionStatusFetchUnknownError(
        'An unknown error occured while fetching the status of a signature',
      );
    }
  }, []);

  return {
    waitForTransactionStatus,
  };
};
