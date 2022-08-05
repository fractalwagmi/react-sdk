import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import React from 'react';
import { Scope, FractalUser } from 'types';

export interface SignInProps {
  clientId: string;
  onError?: (e: unknown) => void;
  onSuccess?: (user: FractalUser) => void;

  /**
   * The scopes to assign to the access token. Defaults to [FractalSdkScope.IDENTIFY].
   *
   * See src/types/scope.ts for a list of available scopes.
   */
  scopes?: Scope[];
}

export function SignIn({ clientId, onError, onSuccess, scopes }: SignInProps) {
  const doError = (e: unknown) => {
    if (!onError) {
      return;
    }
    onError(e);
  };

  const doSuccess = (fractalUser: FractalUser) => {
    if (!onSuccess) {
      return;
    }
    onSuccess(fractalUser);
  };

  const { code, url } = useAuthUrl({
    clientId,
    onError: doError,
    scopes,
  });
  const { signIn } = useSignIn({
    clientId,
    code,
    onSignIn: doSuccess,
    onSignInFailed: doError,
    url,
  });

  return <button onClick={signIn}>Sign in with Fractal</button>;
}
