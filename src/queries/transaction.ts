import { FractalWebsdkTransactionGetTransactionStatusResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import { useQuery } from '@tanstack/react-query';
import { queryContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import {
  FractalSDKTransactionStatusFetchInvalidError,
  FractalSDKTransactionStatusFetchUnknownError,
} from 'core/error';
import { useUser } from 'hooks/public/use-user';
import { isNotNullOrUndefined } from 'lib/guards';
import { secondsInMs } from 'lib/util/time';
import { Status as GrpcStatusCode } from 'nice-grpc-common';
import { useCallback, useEffect, useState } from 'react';

type TransactionStatusResponse =
  FractalWebsdkTransactionGetTransactionStatusResponse;

enum TransactionApiKey {
  GET_TRANSACTION_STATUS = 'GET_TRANSACTION_STATUS',
}

export const TransactionApiKeys = {
  getTransactionStatus: (signature: string) =>
    [
      ApiFeature.TRANSACTION,
      TransactionApiKey.GET_TRANSACTION_STATUS,
      signature,
    ] as const,
};

export const useGetTransactionStatusPollerQuery = (signature: string) => {
  const [shouldPoll, setShouldPoll] = useState(true);
  const { data: user } = useUser();
  const query = useQuery(
    TransactionApiKeys.getTransactionStatus(signature),
    async () => TransactionApi.getTransactionStatus(signature),
    {
      context: queryContext,
      enabled: isNotNullOrUndefined(user),
      refetchInterval: shouldPoll ? secondsInMs(2) : false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    const isTransactionPending = query.data?.confirmed === undefined;
    if (shouldPoll && !isTransactionPending) {
      setShouldPoll(false);
    }
  }, [shouldPoll, query]);

  useEffect(() => {
    if (user === undefined) {
      query.remove();
    }
  }, [query, user]);

  return query;
};

export const useTransactionStatusPoller = () => {
  const poller = useCallback(
    async (signature: string, intervalMs: number = secondsInMs(2)) => {
      let resolve: (success: boolean) => void;
      let reject: (err: unknown) => void;

      const fetchStatusAndQueueRefetchIfUnconfirmed = async () => {
        try {
          const response = await getTransactionStatus(signature);
          if (response.confirmed === undefined) {
            window.setTimeout(() => {
              fetchStatusAndQueueRefetchIfUnconfirmed();
            }, intervalMs);
            return;
          }
          resolve(response.confirmed.success);
        } catch (err: unknown) {
          reject(err);
        }
      };

      return new Promise<boolean>((resolver, rejector) => {
        resolve = resolver;
        reject = rejector;

        fetchStatusAndQueueRefetchIfUnconfirmed();
      });
    },
    [],
  );

  return poller;
};

const TransactionApi = {
  getTransactionStatus,
};

async function getTransactionStatus(
  signature: string,
): Promise<TransactionStatusResponse> {
  const response = await webSdkApiClient.websdk.getTransactionStatus(signature);
  if (response.error) {
    if (response.error.code === GrpcStatusCode.INVALID_ARGUMENT) {
      throw new FractalSDKTransactionStatusFetchInvalidError(
        'Invalid argument supplied for fetching transaction status. ' +
          `Supplied signature:\n${signature}`,
      );
    }
    throw new FractalSDKTransactionStatusFetchUnknownError(
      `There was an error fetching transaction status. err = ${response.error.message}`,
    );
  }
  return response.data;
}
