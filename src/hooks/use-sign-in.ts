import { UserContext } from 'components/sign-in';
import { Events, validateOrigin } from 'core/messaging';
import { useCallback, useContext } from 'react';
import { FractalUser } from 'types/user';

const POPUP_WIDTH_PX = 400;
const POPUP_HEIGHT_PX = 600;

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
    const popup = window.open(
      url,
      'fractal:approval:popup',
      `popup,left=${left},top=${top},width=${POPUP_WIDTH_PX},height=${POPUP_HEIGHT_PX},resizable,scrollbars=yes,status=1`,
    );
    if (popup) {
      window.addEventListener('message', e => {
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
      });
    }
  }, [clientId, code, url, onSignIn]);

  return { signIn };
};
