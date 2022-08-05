import { SignInButton } from 'components/sign-in-button';
import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import { Scope, User } from 'types';

export interface SignInProps {
  clientId: string;
  onError?: (e: unknown) => void;
  onSuccess?: (user: User) => void;
  /**
   * The scopes to assign to the access token. Defaults to [Scope.IDENTIFY].
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

  const doSuccess = (user: User) => {
    if (!onSuccess) {
      return;
    }
    onSuccess(user);
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

  return <SignInButton onClick={signIn}>Sign in with Fractal</SignInButton>;
}
