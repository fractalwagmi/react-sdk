import { UserContext } from 'context/user';
import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useCallback, useContext } from 'react';
import { FractalUser } from 'types/user';

interface UseSignInParameters {
  clientId: string;
  code?: string;
  onSignIn: (user: FractalUser) => void;
  url?: string;
}

export const useSignIn = ({
  clientId,
  code,
  onSignIn,
  url,
}: UseSignInParameters) => {
  const { setUser } = useContext(UserContext);

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
      const handleMessage = (e: MessageEvent) => {
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
          const user = e.data.payload.user;
          setUser(user);
          onSignIn(user);

          popup.close();
        }
      };
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [clientId, code, url, onSignIn]);

  return { signIn };
};
