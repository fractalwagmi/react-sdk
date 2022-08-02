import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import React, { createContext, ReactNode, useState } from 'react';
import { Scope } from 'types/scope';
import { FractalUser } from 'types/user';

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
  const { code, url } = useAuthUrl({
    clientId,
    onError: () => doError(),
    scopes,
  });
  const { signIn } = useSignIn({
    clientId,
    code,
    onSignIn: (user: FractalUser) => {
      if (!onSuccess) {
        return;
      }
      onSuccess(user);
    },
    url,
  });

  const doError = () => {
    if (!onError) {
      return;
    }
    onError();
  };

  return <button onClick={signIn}>Sign in with Fractal</button>;
}
