import { FractalSDKContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { FractalSDKError } from 'core/error';
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
import { isObject } from 'lib/util/guards';
import { useCallback, useContext, useEffect, useRef } from 'react';

const MIN_POPUP_HEIGHT_PX = POPUP_HEIGHT_PX;
const MAX_POPUP_WIDTH_PX = 850;

type SignTransactionErrors =
  | FractalSDKAuthenticationError
  | FractalSDKApprovalOccurringError
  | FractalSDKInvalidTransactionError
  | FractalSDKSignTransactionDeniedError
  | FractalSDKSignTransactionUnknownError;

export const useSignTransaction = () => {
  const { clientId } = useContext(FractalSDKContext);
  const promiseResolversRef = useRef<{
    reject: (err: SignTransactionErrors) => void;
    resolve: (value: { signature: string }) => void;
  } | null>(null);

  const { close, connection, open } = usePopupConnection({
    heightPx: Math.max(
      MIN_POPUP_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.8),
    ),
    widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.8)),
  });

  const fetchAuthorizeUrl = useCallback(
    async (unsignedTransactionB58: string) => {
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
    },
    [connection],
  );

  const handleSignedTransaction = useCallback(
    (payload: unknown) => {
      if (!assertPayloadHasSignature(payload)) {
        promiseResolversRef.current?.reject(
          new FractalSDKSignTransactionUnknownError(
            `Received malformed payload from popup. payload = ${payload}`,
          ),
        );
        return;
      }
      close();
      promiseResolversRef.current?.resolve({ signature: payload.signature });
      promiseResolversRef.current = null;
    },
    [close],
  );

  const handleSignedTransactionDenied = useCallback(() => {
    promiseResolversRef.current?.reject(
      new FractalSDKSignTransactionDeniedError('Transaction was denied'),
    );
    promiseResolversRef.current = null;
    close();
  }, [close]);

  const handleSignedTransactionFailed = useCallback(() => {
    promiseResolversRef.current?.reject(
      new FractalSDKSignTransactionUnknownError('An unknown error occurred.'),
    );
    promiseResolversRef.current = null;
  }, []);

  useEffect(() => {
    if (!connection) {
      return;
    }
    connection.on(Events.SIGNED_TRANSACTION, handleSignedTransaction);
    connection.on(Events.TRANSACTION_DENIED, handleSignedTransactionDenied);
    connection.on(Events.POPUP_CLOSED, handleSignedTransactionDenied);
    connection.on(
      Events.FAILED_TO_SIGN_TRANSACTION,
      handleSignedTransactionFailed,
    );
  }, [
    connection,
    handleSignedTransactionDenied,
    handleSignedTransaction,
    handleSignedTransactionFailed,
  ]);

  const signTransaction = useCallback(
    async (unsignedTransactionB58: string) => {
      (async () => {
        try {
          const { url } = await fetchAuthorizeUrl(unsignedTransactionB58);
          open(url);
        } catch (err: unknown) {
          if (err instanceof FractalSDKError) {
            throw err;
          }
          throw new FractalSDKSignTransactionUnknownError(
            `An unknown error occurred trying to sign the transaction. err = ${err}`,
          );
        }
      })();

      return new Promise<{ signature: string }>((resolve, reject) => {
        promiseResolversRef.current = {
          reject,
          resolve,
        };
      });
    },
    [fetchAuthorizeUrl],
  );

  return {
    signTransaction,
  };
};

interface PayloadWithSignature {
  signature: string;
}

function assertPayloadHasSignature(
  payload: unknown,
): payload is PayloadWithSignature {
  if (!isObject(payload)) {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'signature')) {
    return false;
  }
  return true;
}
