import { FractalSDKContext } from 'context/fractal-sdk-context';
import { FractalSDKError } from 'core/error';
import { maybeGetAccessToken, maybeGetBaseUser } from 'core/token';
import { useSignOut } from 'hooks/public/use-sign-out';
import { useSignIn } from 'hooks/use-sign-in';
import { useUserSetter } from 'hooks/use-user-setter';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Scope, User } from 'types';

export interface UseAuthButtonPropsParameters {
  onError?: (e: FractalSDKError) => void;
  onSignOut?: () => void;
  onSuccess?: (user: User) => void;
  scopes?: Scope[];
}

export interface HeadlessAuthButtonProps {
  loading: boolean;
  onClick: () => void;
  signedIn: boolean;
}

export const useAuthButtonProps = ({
  onError,
  onSignOut,
  onSuccess,
  scopes,
}: UseAuthButtonPropsParameters = {}): HeadlessAuthButtonProps => {
  const [fetchingUser, setFetchingUser] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { clientId, user } = useContext(FractalSDKContext);
  const { fetchAndSetUser } = useUserSetter();
  const { signOut } = useSignOut();

  const doError = useCallback(
    (e: FractalSDKError) => {
      if (!onError) {
        return;
      }
      onError(e);
    },
    [onError],
  );

  const doSuccess = useCallback(
    (user: User) => {
      if (!onSuccess) {
        return;
      }
      onSuccess(user);
    },
    [onSuccess],
  );

  const { signIn } = useSignIn({
    clientId,
    onSignIn: doSuccess,
    onSignInFailed: doError,
    scopes,
  });

  useEffect(() => {
    const baseUserFromLS = maybeGetBaseUser();
    const accessTokenFromLS = maybeGetAccessToken();
    const isAlreadyLoggedIn = Boolean(user);
    if (
      isAlreadyLoggedIn ||
      !baseUserFromLS ||
      !accessTokenFromLS ||
      fetchingUser
    ) {
      return;
    }

    const refreshUser = async () => {
      setFetchingUser(true);
      await fetchAndSetUser(baseUserFromLS, accessTokenFromLS);
      setFetchingUser(false);
      setIsAuthenticating(false);
    };

    refreshUser();
  }, [user, fetchingUser]);

  const signedIn = Boolean(user);
  const onClick = useCallback(() => {
    if (signedIn) {
      signOut();
      onSignOut?.();
    } else {
      setIsAuthenticating(true);
      signIn();
    }
  }, [signedIn, signOut, signIn]);

  return {
    loading: isAuthenticating,
    onClick,
    signedIn,
  };
};
