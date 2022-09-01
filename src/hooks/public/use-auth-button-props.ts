import { FractalSDKContext } from 'context/fractal-sdk-context';
import { FractalSDKError } from 'core/error';
import { maybeGetAccessToken, maybeGetBaseUser } from 'core/token';
import { useSignOut } from 'hooks/public/use-sign-out';
import { useAuthUrl } from 'hooks/use-auth-url';
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
  const { clientId, onResetUser, user } = useContext(FractalSDKContext);
  const { fetchAndSetUser } = useUserSetter();
  const { signOut } = useSignOut();

  if (onSignOut) {
    onResetUser(onSignOut);
  }

  const doError = (e: FractalSDKError) => {
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
    };

    refreshUser();
  }, [user, fetchingUser]);

  const signedIn = Boolean(user);
  const onClick = useCallback(() => {
    if (signedIn) {
      signOut();
    } else {
      signIn();
    }
  }, [signedIn, signOut, signIn]);

  return {
    loading: fetchingUser,
    onClick,
    signedIn,
  };
};
