import { FractalWebsdkApprovalAuthorizeTransactionResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { FractalSDKAuthenticationError } from 'core/error/auth';
import {
  FractalSDKSignTransactionDeniedError,
  FractalSDKSignTransactionUnknownError,
  FractalSDKInvalidTransactionError,
} from 'core/error/transaction';
import { Events } from 'core/messaging';
import { maybeGetAccessToken } from 'core/token';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { assertObject } from 'lib/util/guards';
import { useCallback, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

type SignTransactionErrors =
  | FractalSDKAuthenticationError
  | FractalSDKInvalidTransactionError
  | FractalSDKInvalidTransactionError
  | FractalSDKSignTransactionDeniedError
  | FractalSDKSignTransactionUnknownError;

interface UseSignTransactionParameters {
  /** The unsigned transaction as a base-58 string. */
  unsignedTransactionB58: string | undefined;
}

interface UseSignTransactionHookReturn {
  /** The transaction signature. */
  data: string | undefined;
  error: SignTransactionErrors | undefined;
}

export const useSignTransaction = ({
  unsignedTransactionB58,
}: UseSignTransactionParameters): UseSignTransactionHookReturn => {
  const shouldInitiateRequest =
    unsignedTransactionB58 !== undefined &&
    unsignedTransactionB58.trim() !== '';

  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [signTransactionError, setSignTransactionError] = useState<
    SignTransactionErrors | undefined
  >(undefined);
  const { close, connection, open } = usePopupConnection({
    enabled: shouldInitiateRequest,
    heightPx: Math.floor(window.innerHeight * 0.8),
    widthPx: Math.floor(window.innerWidth * 0.8),
  });
  const { clientId } = useContext(FractalSDKContext);

  useEffect(() => {
    setSignTransactionError(undefined);
  }, [unsignedTransactionB58]);

  const authorizeCacheKey = shouldInitiateRequest
    ? [Endpoint.AUTHORIZE_TRANSACTION, unsignedTransactionB58, clientId]
    : null;
  const { data, error: authorizeRequestError } = useSWR<
    FractalWebsdkApprovalAuthorizeTransactionResponse,
    SignTransactionErrors
  >(authorizeCacheKey, async () => {
    const accessToken = maybeGetAccessToken();
    if (!accessToken) {
      throw new FractalSDKAuthenticationError(
        'Invalid or missing authentication token',
      );
    }
    try {
      const response = await webSdkApiClient.websdk.authorize(
        {
          clientId,
          unsigned: unsignedTransactionB58,
        },
        {
          headers: maybeIncludeAuthorizationHeaders(
            accessToken,
            Endpoint.AUTHORIZE_TRANSACTION,
          ),
        },
      );

      return response.data;
    } catch (err: unknown) {
      throw new FractalSDKInvalidTransactionError(
        `Unable to initiate sign transaction flow. ${err}`,
      );
    }
  });

  const handleSignedTransaction = useCallback(
    (payload: unknown) => {
      if (!assertPayloadHasSignature(payload)) {
        setSignTransactionError(
          new FractalSDKSignTransactionUnknownError(
            `Received malformed payload from popup. payload = ${payload}`,
          ),
        );
        return;
      }
      close();
      setSignature(payload.signature);
    },
    [close],
  );

  const handleSignedTransactionDenied = useCallback(() => {
    setSignTransactionError(
      new FractalSDKSignTransactionDeniedError('Transaction was denied'),
    );
    close();
  }, [close]);

  const handleSignedTransactionFailed = useCallback(() => {
    setSignTransactionError(
      new FractalSDKSignTransactionUnknownError('An unknown error occurred.'),
    );
  }, [close]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    if (shouldInitiateRequest) {
      connection.on(Events.SIGNED_TRANSACTION, handleSignedTransaction);
      connection.on(Events.TRANSACTION_DENIED, handleSignedTransactionDenied);
      connection.on(Events.POPUP_CLOSED, handleSignedTransactionDenied);
      connection.on(
        Events.FAILED_TO_SIGN_TRANSACTION,
        handleSignedTransactionFailed,
      );
    } else {
      connection.off(Events.SIGNED_TRANSACTION, handleSignedTransaction);
      connection.off(Events.TRANSACTION_DENIED, handleSignedTransactionDenied);
      connection.off(Events.POPUP_CLOSED, handleSignedTransactionDenied);
      connection.off(
        Events.FAILED_TO_SIGN_TRANSACTION,
        handleSignedTransactionFailed,
      );
    }
  }, [
    shouldInitiateRequest,
    connection,
    handleSignedTransaction,
    handleSignedTransactionFailed,
  ]);

  if (!connection && data?.url) {
    open(data.url);
  }

  return {
    data: signature,
    error: authorizeRequestError ?? signTransactionError,
  };
};

interface PayloadWithSignature {
  signature: string;
}

function assertPayloadHasSignature(
  payload: unknown,
): payload is PayloadWithSignature {
  if (!assertObject(payload)) {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'signature')) {
    return false;
  }
  return true;
}
