import { FractalWebsdkApprovalAuthorizeTransactionResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { FractalSDKApprovalOccurringError } from 'core/error/approve';
import { FractalSDKAuthenticationError } from 'core/error/auth';
import {
  FractalSDKSignTransactionDeniedError,
  FractalSDKSignTransactionUnknownError,
  FractalSDKInvalidTransactionError,
} from 'core/error/transaction';
import { Events } from 'core/messaging';
import { POPUP_HEIGHT_PX } from 'core/popup';
import { maybeGetAccessToken } from 'core/token';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { createCacheToken } from 'lib/util/cache-token';
import { assertObject } from 'lib/util/guards';
import { useCallback, useContext, useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';

const MIN_POPUP_HEIGHT_PX = POPUP_HEIGHT_PX;
const MAX_POPUP_WIDTH_PX = 850;

type SignTransactionErrors =
  | FractalSDKAuthenticationError
  | FractalSDKApprovalOccurringError
  | FractalSDKInvalidTransactionError
  | FractalSDKSignTransactionDeniedError
  | FractalSDKSignTransactionUnknownError;

interface UseSignTransactionParameters {
  /** The unsigned transaction as a base-58 string. */
  unsignedTransactionB58: string | undefined;
}

interface UseSignTransactionHookReturn {
  approving: boolean;
  /** The transaction signature. */
  data: string | undefined;
  error: SignTransactionErrors | undefined;
  /**
   * A function to call to re-initiate the approval request for a given unsigned
   * transaction.
   *
   * This is useful if a user denies a particular transaction, but you want to
   * manually re-initiate the approval request again for the same unsigned transaction.
   *
   * An approval will not be sent multiple times for the same
   * `unsignedTransactionB58` input by default (unless the page refreshes.)
   */
  refetch: () => void;
}

export const useSignTransaction = ({
  unsignedTransactionB58,
}: UseSignTransactionParameters): UseSignTransactionHookReturn => {
  const maybeInitiateRequest =
    unsignedTransactionB58 !== undefined &&
    unsignedTransactionB58.trim() !== '';

  const [cacheToken, setCacheToken] = useState(createCacheToken());
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [signTransactionError, setSignTransactionError] = useState<
    SignTransactionErrors | undefined
  >(undefined);
  const { close, connection, open } = usePopupConnection({
    enabled: maybeInitiateRequest,
    heightPx: Math.max(
      MIN_POPUP_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.8),
    ),
    widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.8)),
  });
  const { clientId } = useContext(FractalSDKContext);

  useEffect(() => {
    setSignTransactionError(undefined);
  }, [unsignedTransactionB58]);

  const authorizeCacheKey = maybeInitiateRequest
    ? [
        Endpoint.AUTHORIZE_TRANSACTION,
        unsignedTransactionB58,
        clientId,
        cacheToken,
      ]
    : null;
  // Using` useSWRImmutable` sets the revalidation booleans to `false`. This
  // ensures we don't fetch a URL for a given unsignedTransaction that has
  // already been requested. We invert control back to the caller to manually
  // re-attempt if needed by using the `rerequest` function.
  const { data, error: authorizeRequestError } = useSWRImmutable<
    FractalWebsdkApprovalAuthorizeTransactionResponse,
    SignTransactionErrors
  >(authorizeCacheKey, async () => {
    if (connection) {
      throw new FractalSDKApprovalOccurringError(
        `An approval flow for a previous transaction is already occurring`,
      );
    }
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

    if (maybeInitiateRequest) {
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
    maybeInitiateRequest,
    connection,
    handleSignedTransaction,
    handleSignedTransactionFailed,
  ]);

  useEffect(() => {
    if (data?.url) {
      open(data.url);
    }
  }, [data?.url]);

  const refetch = useCallback(() => {
    setCacheToken(createCacheToken());
  }, []);

  return {
    approving: Boolean(connection),
    data: signature,
    error: authorizeRequestError ?? signTransactionError,
    refetch,
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
