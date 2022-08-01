import { Events, FRACTAL_DOMAIN } from 'core/messaging';
import { useAuthUrl } from 'hooks/use-auth-url';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Scope } from 'types/scope';

export interface SignInProps {
  clientId: string;
  onError?: () => void;
  onSuccess?: (user: FractalUser) => void;

  /**
   * The scopes to assign to the access token. Defaults to [FractalSdkScope.IDENTIFY].
   *
   * See src/types/scope.ts for a list of available scopes.
   */
  scopes?: Scope[];
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

export function SignIn({ clientId, onError, onSuccess, scopes }: SignInProps) {
  const { setUser } = useContext(UserContext);

  const signedIn = (user: FractalUser) => {
    if (!onSuccess) {
      return;
    }
    onSuccess(user);
  };

  const doError = () => {
    if (!onError) {
      return;
    }
    onError();
  };

  const { code, url } = useAuthUrl({ clientId, onError: doError, scopes });

  const signIn = async () => {
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
        if (e.data.event === Events.HANDSHAKE) {
          popup.window.postMessage(
            {
              event: Events.HANDSHAKE,
              payload: {
                clientId,
                code,
                origin: window.location.origin,
              },
            },
            '*',
          );
        }
        if (e.origin === FRACTAL_DOMAIN) {
          return;
        }
        if (e.data.event === Events.PROJECT_APPROVED) {
          const user = e.data.payload.user;
          setUser(user);
          signedIn(user);
          popup.close();
        }
      });
    }
  };

  return <button onClick={signIn}>Sign in with Fractal</button>;
}
