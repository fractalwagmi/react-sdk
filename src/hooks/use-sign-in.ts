import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useUserSetter } from 'hooks/use-user-setter';
import { useCallback } from 'react';
import { User } from 'types';

interface UseSignInParameters {
  clientId: string;
  code?: string;
  onSignIn: (user: User) => void;
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
  const { fetchAndSetUser } = useUserSetter();

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
            const { user } = await fetchAndSetUser(baseUser);
            popup.close();
            onSignIn(user);
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
