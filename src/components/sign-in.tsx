import { authApiClient } from 'core/api/client';
import { Events, FRACTAL_DOMAIN } from 'core/messaging';
import { isHttpResponse } from 'lib/fetch/is-http-response';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface SignInProps {
  clientId: string;
  onError?: () => void;
  onSuccess?: (user: FractalUser) => void;
}

export interface FractalUser {
  accessToken: string;
  // publicKey: string;
  userId: string;
  // username: string;
}

interface UserContextState {
  setUser: (user: FractalUser | undefined) => void;
  user?: FractalUser;
}

export const UserContext = createContext<UserContextState>({
  setUser: () => undefined,
  user: undefined,
});

export interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<FractalUser | undefined>(undefined);

  return (
    <UserContext.Provider value={{ setUser, user }}>
      {children}
    </UserContext.Provider>
  );
}

export function SignIn({ clientId, onError, onSuccess }: SignInProps) {
  const { setUser, user } = useContext(UserContext);
  const [url, setUrl] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    const getUrl = async () => {
      try {
        const urlInfo = (
          await authApiClient.v2.getUrl({
            clientId,
            // TODO(Kan): Allow configuring these permissions.
            scope: ['items:read', 'coins:read', 'identify'],
          })
        ).data;
        setUrl(urlInfo.url);
        setCode(urlInfo.code);
      } catch {
        doError();
      }
    };
    getUrl();
  }, []);

  useEffect(() => {
    const pollForApproval = async () => {
      if (code) {
        const interval = setInterval(async () => {
          try {
            const approval = (
              await authApiClient.v2.getResult({ clientId, code })
            ).data;
            if (approval.bearerToken && approval.userId) {
              const signedInUser = {
                accessToken: approval.bearerToken,
                userId: approval.userId,
              };
              setUser(signedInUser);
              signedIn(signedInUser);
              clearInterval(interval);
            } else {
              throw new Error('No token returned');
            }
          } catch (err: unknown) {
            if (!isHttpResponse(err)) {
              console.error('Unknown error: ', err);
              clearInterval(interval);
              doError();
              return;
            }
            if (err.status === 401) {
              return;
            } else {
              clearInterval(interval);
              doError();
              return;
            }
          }
        }, 3000);
      }
    };
    pollForApproval();
  }, [code]);

  const signIn = async () => {
    console.log('SIGN IN CALLED');
    const width = 400;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open(
      url,
      'fractal:approval:popup',
      `popup,left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`,
    );
    if (popup) {
      window.addEventListener('message', e => {
        if (e.origin === FRACTAL_DOMAIN) {
          return;
        }
        if (e.data.event === Events.PROJECT_APPROVED) {
          popup.close();
          // Need to pass data through postMessage that comes from approval/result before we can use this to remove poller.
          // signedIn();
        }
      });
    }
  };

  const signedIn = (user: FractalUser) => {
    if (onSuccess) {
      onSuccess(user);
    }
  };

  const doError = () => {
    if (onError) {
      onError();
    }
  };

  console.log(user);

  return <button onClick={signIn}>Sign in with Fractal</button>;
}
