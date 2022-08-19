import { Events, validateOrigin } from 'core/messaging';
import { openPopup, POPUP_HEIGHT_PX, POPUP_WIDTH_PX } from 'core/popup';
import { useUserSetter } from 'hooks/use-user-setter';
import { useCallback } from 'react';
import { BaseUser, User } from 'types';

interface UseSignInParameters {
  clientId: string;
  code: string | undefined;
  onSignIn: (user: User) => void;
  onSignInFailed: (e: unknown) => void;
  url: string | undefined;
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

        if (!popup.window) {
          // This is a sanity check in case popup.window is not defined.
          // This can happen when a user exits the popup without completing the
          // sign in flow, and then opening another popup.
          //
          // TODO: Fix multiple event listeners from registering.
          return;
        }

        if (e.data.event === Events.HANDSHAKE) {
          popup.window.postMessage(
            {
              event: Events.HANDSHAKE_ACK,
            },
            e.origin,
          );
        }
        if (e.data.event === Events.PROJECT_APPROVED) {
          try {
            const userId = e.data.payload.user.userId;
            const accessToken = e.data.payload.user.accessToken;
            const baseUser: BaseUser = { userId };
            const { user } = await fetchAndSetUser(baseUser, accessToken);
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
