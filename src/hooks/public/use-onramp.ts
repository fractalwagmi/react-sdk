import { Platform, usePopupConnection } from '@fractalwagmi/popup-connection';
import { ButtonProps } from 'components/button';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { FractalSDKError } from 'core/error';
import { FractalSDKOnrampUnknownError } from 'core/error/onramp';
import { Awaitable } from 'hooks/public/types';
import { useCallback, useContext, useRef } from 'react';

const ONRAMP_URL = 'https://fractal.is/onramp';

const MIN_POPUP_HEIGHT_PX = 672;
const MAX_POPUP_WIDTH_PX = 850;

type OnrampErrors = FractalSDKError | FractalSDKOnrampUnknownError;

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
   * The button style variant to use.
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

  const promiseResolversRef = useRef<{
    reject: (err: OnrampErrors) => void;
    resolve: () => void;
  } | null>(null);

  const { open: openPopup } = usePopupConnection({
    enabled: !user,
    heightPx: Math.max(
      MIN_POPUP_HEIGHT_PX,
      Math.floor(window.innerHeight * 0.8),
    ),
    platform: Platform.REACT_SDK,
    widthPx: Math.min(MAX_POPUP_WIDTH_PX, Math.floor(window.innerWidth * 0.5)),
  });

  const openOnrampWindow = useCallback(async () => {
    await (async () => {
      try {
        openPopup(`${ONRAMP_URL}?clientId=${clientId}&theme=${theme}`);
        onFulfillmentComplete?.();
      } catch (err: unknown) {
        const onrampErr = asOnrampError(err);
        if (onRejected) {
          onRejected(onrampErr);
          return;
        }
        throw onrampErr;
      }
    })();

    return new Promise<void>((resolve, reject) => {
      promiseResolversRef.current = {
        reject,
        resolve,
      };
    });
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
