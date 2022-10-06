import { FractalWebsdkTransactionGetTransactionStatusResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import { useQuery } from '@tanstack/react-query';
import { webSdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import { FractalSDKGetCoinsUnknownError } from 'core/error';
import { useUser } from 'hooks/public/use-user';
import { secondsInMs } from 'lib/util/time';
import { useEffect, useState } from 'react';

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
  const [stopPolling, setStopPolling] = useState(false);
  const { data: user } = useUser();
  const query = useQuery(
    TransactionApiKeys.getTransactionStatus(signature),
    async () => TransactionApi.getTransactionStatus(signature),
    {
      enabled: user !== undefined,
      refetchInterval: stopPolling ? false : secondsInMs(2),
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!stopPolling && query.data?.confirmed?.success !== undefined) {
      setStopPolling(true);
    }
  }, [stopPolling, query]);

  useEffect(() => {
    if (user === undefined) {
      query.remove();
    }
  }, [user]);

  return query;
};

const TransactionApi = {
  getTransactionStatus,
};

async function getTransactionStatus(
  signature: string,
): Promise<FractalWebsdkTransactionGetTransactionStatusResponse> {
  const response = await webSdkApiClient.websdk.getTransactionStatus(signature);
  if (response.error) {
    throw new FractalSDKGetCoinsUnknownError(
      `There was an error fetching coins. err = ${response.error.message}`,
    );
  }
  return response.data;
}
