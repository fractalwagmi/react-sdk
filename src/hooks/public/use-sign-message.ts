import {
  usePopupConnection,
  PopupEvent,
  DEFAULT_POPUP_HEIGHT_PX,
  Platform,
  assertPayloadIsMessageSignatureNeededResponsePayload,
  MessageSignatureNeededPayload,
} from '@fractalwagmi/popup-connection';
import { FractalSDKApprovalOccurringError } from 'core/error/approve';
import { FractalSDKAuthenticationError } from 'core/error/auth';
import {
  FractalSDKSignTransactionDeniedError,
  FractalSDKSignTransactionUnknownError,
  FractalSDKInvalidTransactionError,
} from 'core/error/transaction';
import { createNonce } from 'lib/util/nonce';
import { useCallback, useRef } from 'react';

const MIN_POPUP_HEIGHT_PX = DEFAULT_POPUP_HEIGHT_PX;
const MAX_POPUP_WIDTH_PX = 850;
const FRACTAL_DOMAIN_HTTPS = 'https://fractal.is';
const SIGN_MESSAGE_PAGE_URL = `${FRACTAL_DOMAIN_HTTPS}/message/sign-web-sdk`;

type SignTransactionErrors =
  | FractalSDKAuthenticationError
  | FractalSDKApprovalOccurringError
  | FractalSDKInvalidTransactionError
  | FractalSDKSignTransactionDeniedError
  | FractalSDKSignTransactionUnknownError;

export const useSignMessage = () => {
  const promiseResolversRef = useRef<{
    reject: (err: SignTransactionErrors) => void;
    resolve: (value: { encodedSignature: Uint8Array }) => void;
  } | null>(null);

  const nonce = createNonce();

  const { close, connection, open } = usePopupConnection({
    heightPx: Math.max(
      MIN_POPUP_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.8),
    ),
    platform: Platform.REACT_SDK,
    widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.8)),
  });

  const handleMessageSignatureNeededResponse = useCallback(
    (payload: unknown) => {
      if (!assertPayloadIsMessageSignatureNeededResponsePayload(payload)) {
        const error = new FractalSDKSignTransactionUnknownError(
          'Malformed payload when signing message. ' +
            'Expected { decodedSignature: string } ' +
            `but received ${JSON.stringify(payload)}`,
        );
        promiseResolversRef.current?.reject(error);
        close();
        return;
      }

      const encodedSignature = Uint8Array.from(
        payload.decodedSignature.split(',').map(n => Number(n)),
      );
      promiseResolversRef.current?.resolve({ encodedSignature });
      close();
    },
    [close],
  );

  const handleClosedOrDeniedByUser = useCallback(() => {
    promiseResolversRef.current?.reject(
      new FractalSDKSignTransactionDeniedError(
        'The user did not approve the message',
      ),
    );
    close();
  }, [close]);

  const signMessage = useCallback(
    async (encodedMessage: Uint8Array) => {
      if (!connection) {
        throw new FractalSDKSignTransactionUnknownError(
          'Expected popup connection to be defined',
        );
      }
      const decodedMessage = new TextDecoder().decode(encodedMessage);

      const handleAuthLoaded = () => {
        const payload: MessageSignatureNeededPayload = {
          decodedMessage,
        };
        connection?.send({
          event: PopupEvent.MESSAGE_SIGNATURE_NEEDED,
          payload,
        });
      };

      open(`${SIGN_MESSAGE_PAGE_URL}/${nonce}`, nonce);
      connection.on(
        PopupEvent.MESSAGE_SIGNATURE_NEEDED_RESPONSE,
        handleMessageSignatureNeededResponse,
      );
      connection.on(PopupEvent.TRANSACTION_DENIED, handleClosedOrDeniedByUser);
      connection.on(PopupEvent.POPUP_CLOSED, handleClosedOrDeniedByUser);
      connection.on(PopupEvent.AUTH_LOADED, handleAuthLoaded);

      return new Promise<{ encodedSignature: Uint8Array }>(
        (resolve, reject) => {
          promiseResolversRef.current = {
            reject,
            resolve,
          };
        },
      );
    },
    [
      connection,
      handleClosedOrDeniedByUser,
      handleMessageSignatureNeededResponse,
      nonce,
      open,
    ],
  );

  return {
    signMessage,
  };
};
