import { FractalSDKContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import { Events } from 'core/messaging';
import { usePopupConnection } from 'hooks/use-popup-connection';
import { useCallback, useContext, useEffect, useState } from 'react';

/**
 * Returns a function, `signTransaction`, that returns a promise which resolves
 * when a transaction is signed.
 *
 * Keep in mind that although a transaction may be signed, there will be a delay
 * before it is posted to the chain.
 */
export const useSignTransaction = () => {
  const { close, connection, open } = usePopupConnection();
  const { clientId } = useContext(FractalSDKContext);
  const [promiseResolvers, setPromiseResolvers] = useState<{
    reject: null | (() => void);
    resolve: null | (() => void);
  }>({
    reject: null,
    resolve: null,
  });

  const handleSignedTransaction = useCallback(() => {
    connection?.off(Events.SIGNED_TRANSACTION, handleSignedTransaction);
    close();
    promiseResolvers.resolve?.();
  }, [connection, close, promiseResolvers]);

  const handleSignedTransactionFailed = useCallback(() => {
    connection?.off(
      Events.FAILED_TO_SIGN_TRANSACTION,
      handleSignedTransactionFailed,
    );
    close();
    promiseResolvers.reject?.();
  }, [connection, close, promiseResolvers]);

  const signTransaction = useCallback(
    async (unsignedTransactionB58: string) => {
      // TODO(ricebin/obber): pass in orgin
      try {
        const response = await webSdkApiClient.websdk.authorize({
          clientId,
          unsigned: unsignedTransactionB58,
        });

        open(response.data.url);
      } catch (err: unknown) {
        // TODO: Add error handling.
        console.log('Unable to initiate sign transaction flow. err = ', err);
        throw err;
      }

      return new Promise<void>((resolve, reject) => {
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
