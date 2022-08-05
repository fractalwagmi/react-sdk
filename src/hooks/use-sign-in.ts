import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useFractalUserSetter } from 'hooks/use-fractal-user-setter';
import { useCallback } from 'react';
import { FractalUser } from 'types';

interface UseSignInParameters {
  clientId: string;
  code?: string;
  onSignIn: (user: FractalUser) => void;
  onSignInFailed: (e: unknown) => void;
  url?: string;
}

export const useSignIn = ({
  clientId,
  code,
  onSignIn,
  onSignInFailed,
  url,
}: UseSignInParameters) => {
  const { fetchAndSetFractalUser } = useFractalUserSetter();

  const signIn = useCallback(async () => {
    if (!url || !code) {
      return;
    }

    const left = window.screenX + (window.innerWidth - POPUP_WIDTH_PX) / 2;
    const top = window.screenY + (window.innerHeight - POPUP_HEIGHT_PX) / 2;
    const popup = openPopup({
      left,
      top,
      url,
    });
    if (popup) {
      const handleMessage = async (e: MessageEvent) => {
        // We only care about events from our own domain.
        if (!validateOrigin(e.origin)) {
          return;
        }

        if (e.data.event === Events.HANDSHAKE) {
          const payload = {
            clientId,
            code,
          };
          popup.window.postMessage(
            {
              event: Events.HANDSHAKE_ACK,
              payload,
            },
            e.origin,
          );
        }
        if (e.data.event === Events.PROJECT_APPROVED) {
          try {
            const baseUser = e.data.payload.user;
            const { fractalUser } = await fetchAndSetFractalUser(baseUser);
            popup.close();
            onSignIn(fractalUser);
          } catch (e: unknown) {
            onSignInFailed(e);
          }
        }
      };
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [clientId, code, url, onSignIn, onSignInFailed]);

  return { signIn };
};
