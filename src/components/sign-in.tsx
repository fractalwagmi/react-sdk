import { THREE_SECONDS_MS } from 'constants/time';

import { authApiClient } from 'core/api/client';
import { Events, FRACTAL_DOMAIN } from 'core/messaging';
import { verifyScopes } from 'core/scope';
import { isHttpResponse } from 'lib/fetch/is-http-response';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Scope } from 'types/scope';

const DEFAULT_SCOPE = [Scope.IDENTIFY];

export interface SignInProps {
  clientId: string;
  onError?: () => void;
  onSuccess?: (user: FractalUser) => void;

  /**
   * The scopes to assign to the access token. Defaults to [FractalSdkScope.IDENTIFY].
   *
   * See src/types/scope.ts for a list of available scopes.
   */
  scope?: Scope[];
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

export function SignIn({
  clientId,
  onError,
  onSuccess,
  scope = DEFAULT_SCOPE,
}: SignInProps) {
  const { setUser, user } = useContext(UserContext);
  const [url, setUrl] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  if (!verifyScopes(scope)) {
    console.error(
      'Invalid scopes. Be sure to pass in at least one of the values from ' +
        'types/scope.ts. Defaulting to `[Scope.IDENTIFY]`.',
    );
    scope = DEFAULT_SCOPE;
  }

  useEffect(() => {
    const getUrl = async () => {
      try {
        const urlInfo = (
          await authApiClient.v2.getUrl({
            clientId,
            scope,
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
      if (!code) {
        return;
      }

      const interval = setInterval(async () => {
        try {
          const approval = (
            await authApiClient.v2.getResult({ clientId, code })
          ).data;
          if (!approval.bearerToken || !approval.userId) {
            throw new Error('No token returned');
          }
          const signedInUser = {
            accessToken: approval.bearerToken,
            userId: approval.userId,
          };
          setUser(signedInUser);
          signedIn(signedInUser);
          clearInterval(interval);
        } catch (err: unknown) {
          if (!isHttpResponse(err)) {
            console.error('Unknown error: ', err);
            clearInterval(interval);
            doError();
            return;
          }
          if (err.status === 401) {
            return;
          }

          clearInterval(interval);
          doError();
        }
      }, THREE_SECONDS_MS);
    };
    pollForApproval();
  }, [code]);

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
        if (e.origin === FRACTAL_DOMAIN) {
          return;
        }
        if (e.data.event === Events.PROJECT_APPROVED) {
          popup.close();
          // Need to pass data through postMessage that comes from
          // approval/result before we can use this to remove poller.
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
