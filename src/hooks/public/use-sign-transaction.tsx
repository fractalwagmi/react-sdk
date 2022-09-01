import { FractalSDKContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { Events } from 'core/messaging';
import { maybeGetAccessToken } from 'core/token';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { assertObject } from 'lib/util/guards';
import { useCallback, useContext, useEffect, useState } from 'react';

/**
 * Returns a function, `signTransaction`, that returns a promise which resolves
 * with a transaction signature when a transaction is signed.
 *
 * Keep in mind that although a transaction may be signed, there will be a delay
 * before it is posted to the chain.
 */
export const useSignTransaction = () => {
  const { close, connection, open } = usePopupConnection();
  const { clientId } = useContext(FractalSDKContext);
  const [promiseResolvers, setPromiseResolvers] = useState<{
    reject: null | (() => void);
    resolve: null | ((signature: string) => void);
  }>({
    reject: null,
    resolve: null,
  });

  const handleSignedTransaction = useCallback(
    (payload: unknown) => {
      if (!assertPayloadHasSignature(payload)) {
        console.error(
          'Malformed response for signed transaction. payload = ',
          payload,
        );
        return;
      }
      close();
      promiseResolvers.resolve?.(payload.signature);
    },
    [connection, close, promiseResolvers],
  );

  const handleSignedTransactionFailed = useCallback(() => {
    close();
    promiseResolvers.reject?.();
  }, [connection, close, promiseResolvers]);

  const signTransaction = useCallback(
    async (unsignedTransactionB58: string) => {
      // TODO(ricebin/obber): pass in orgin
      const accessToken = maybeGetAccessToken();
      if (!accessToken) {
        // TODO handle this, shouldn't happen.
        throw new Error('No access token');
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

        open(response.data.url);
      } catch (err: unknown) {
        // TODO: Add error handling.
        console.log('Unable to initiate sign transaction flow. err = ', err);
        throw err;
      }

      return new Promise<string>((resolve, reject) => {
        setPromiseResolvers({
          reject,
          resolve,
        });
      });
    },
    [clientId, connection, open, close],
  );

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.on(Events.SIGNED_TRANSACTION, handleSignedTransaction);
    connection.on(
      Events.FAILED_TO_SIGN_TRANSACTION,
      handleSignedTransactionFailed,
    );

    return () => {
      connection.off(Events.SIGNED_TRANSACTION, handleSignedTransaction);
      connection.off(
        Events.FAILED_TO_SIGN_TRANSACTION,
        handleSignedTransactionFailed,
      );
    };
  }, [connection, handleSignedTransaction, handleSignedTransactionFailed]);

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
  if (!assertObject(payload)) {
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'signature')) {
    return false;
  }
  return true;
}
