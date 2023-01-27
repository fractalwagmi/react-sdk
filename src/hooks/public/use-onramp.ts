import {
  Platform,
  PopupEvent,
  usePopupConnection,
} from '@fractalwagmi/popup-connection';
import { ButtonProps } from 'components/button';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { FractalSDKError } from 'core/error';
import {
  FractalSDKOnrampAuthError,
  FractalSDKOnrampUnknownError,
} from 'core/error/onramp';
import { Awaitable } from 'hooks/public/types';
import { useCallback, useContext, useEffect } from 'react';

const ONRAMP_URL = 'https://fractal.is/onramp';

const MIN_POPUP_HEIGHT_PX = 672;
const MAX_POPUP_WIDTH_PX = 800;

type OnrampErrors =
  | FractalSDKError
  | FractalSDKOnrampUnknownError
  | FractalSDKOnrampAuthError;

export interface UseOnrampOptions {
  /**
   * A callback to invoke after an onramp session has been fulfilled, meaning
   * that payment was processed and funds were delivered to the user's wallet.
   */
  onFulfillmentComplete?: () => Awaitable<void>;
  /**
   * A callback to invoke after an onramp session was rejected for a known
   * reason. Possible reasons may include KYC failure, sanctions screening
   * issues, fraud checks.
   */
  onRejected?: (err: OnrampErrors) => Awaitable<void>;
  /**
   * The theme variant to use for the onramp experience.
   *
   * Possible values: 'light' | 'dark'. Defaults to 'light'.
   */
  theme?: ButtonProps['theme'];
}

export const useOnramp = (
  { onFulfillmentComplete, onRejected, theme }: UseOnrampOptions = {
    theme: 'light',
  },
) => {
  const { clientId, user } = useContext(FractalSDKContext);

  const { connection, open: openPopup } = usePopupConnection({
    enabled: !user,
    heightPx: Math.max(
      MIN_POPUP_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.8),
    ),
    platform: Platform.REACT_SDK,
    widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.6)),
  });

  const handleOnRejected = useCallback((err: unknown) => {
    const onrampErr = asOnrampError(err);
    onRejected?.(onrampErr);
  }, []);

  useEffect(() => {
    if (!connection) {
      return;
    }
    if (onFulfillmentComplete) {
      connection.on(
        PopupEvent.ONRAMP_FULFILLMENT_COMPLETE,
        onFulfillmentComplete,
      );
    }
    if (onRejected) {
      connection.on(PopupEvent.ONRAMP_REJECTED, handleOnRejected);
    }

    return () => {
      if (!connection) {
        return;
      }
      if (onFulfillmentComplete) {
        connection.off(
          PopupEvent.ONRAMP_FULFILLMENT_COMPLETE,
          onFulfillmentComplete,
        );
      }
      if (onRejected) {
        connection.off(PopupEvent.ONRAMP_REJECTED, handleOnRejected);
      }
    };
  }, [connection]);

  const openOnrampWindow = useCallback(async () => {
    if (!user) {
      throw new FractalSDKOnrampAuthError(
        'User must be signed in to a Fractal Wallet to start an onramp session',
      );
    }
    openPopup(`${ONRAMP_URL}?clientId=${clientId}&theme=${theme}`);
  }, []);

  return { openOnrampWindow };
};

function asOnrampError(err: unknown): OnrampErrors {
  if (err instanceof FractalSDKError) {
    return err;
  }

  return new FractalSDKOnrampUnknownError(
    `An unknown error occurred during the onramp session. err = ${err}`,
  );
}
