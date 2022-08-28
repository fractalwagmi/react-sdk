import { AuthButton, AuthButtonProps } from 'components/auth-button';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { FractalSDKError } from 'core/error';
import { maybeGetAccessToken, maybeGetBaseUser } from 'core/token';
import { useSignOut, useUser, useUserSetter } from 'hooks';
import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import React, { HTMLAttributes, useContext, useEffect, useState } from 'react';
import { Scope, User } from 'types';

const DEFAULT_SIGN_IN_BUTTON_TEXT = 'Sign in with Fractal';
const DEFAULT_SIGN_OUT_BUTTON_TEXT = 'Sign out';

export interface SignInProps {
  /**
   * Any additional props for <button> that should be passed to the default
   * sign-in button.
   */
  buttonProps?: HTMLAttributes<HTMLButtonElement>;
  /**
   * Optional component to render instead of the default sign-in button. If
   * defining this prop, it's recommended that you also define
   * `signOutComponent` to control what the button looks like for the purposes
   * of signing out.
   */
  component?: React.ReactElement;
  /**
   * Whether to hide the button completely when signed in or not.
   *
   * Defaults to `false`.
   */
  hideWhenSignedIn?: boolean;
  onError?: (e: FractalSDKError) => void;
  onSignOut?: () => void;
  onSuccess?: (user: User) => void;
  /**
   * The scopes to assign to the access token. Defaults to [Scope.IDENTIFY].
   *
   * See src/types/scope.ts for a list of available scopes.
   */
  scopes?: Scope[];
  /** Optional component to render instead of the default sign-out button. */
  signOutComponent?: React.ReactElement;
  /**
   * The button style variant to use.
   *
   * Possible values: 'light' | 'dark'. Defaults to 'light'.
   */
  variant?: AuthButtonProps['variant'];
}

export const SignIn = ({
  buttonProps = {},
  component,
  signOutComponent,
  hideWhenSignedIn = false,
  onError,
  onSuccess,
  onSignOut,
  scopes,
  variant = 'light',
}: SignInProps) => {
  const { onResetUser } = useContext(FractalSDKContext);
  const { data: user } = useUser();
  const { signOut } = useSignOut();
  const [fetchingUser, setFetchingUser] = useState(false);
  const { clientId } = useContext(FractalSDKContext);
  const { fetchAndSetUser } = useUserSetter();

  if (onSignOut) {
    onResetUser(onSignOut);
  }

  const signedIn = Boolean(user);

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

  if (signedIn && hideWhenSignedIn) {
    return null;
  }

  if (signedIn && signOutComponent) {
    return React.cloneElement(signOutComponent, {
      onClick: signOut,
    });
  }

  // We explicitly don't do a `!signedIn && component` check here because we
  // want to guarantee that if a caller provides a `component`, it will always
  // be rendered even when they are logged in and aren't passing in a
  // `signOutComponent`.
  //
  // This prevents accidentally showing OUR sign out component when signed in
  // but THEIR sign in component when signed out.
  if (component) {
    return React.cloneElement(component, {
      onClick: signIn,
    });
  }

  return (
    <AuthButton
      variant={variant}
      onClick={signedIn ? signOut : signIn}
      buttonText={
        signedIn ? DEFAULT_SIGN_OUT_BUTTON_TEXT : DEFAULT_SIGN_IN_BUTTON_TEXT
      }
      {...buttonProps}
      loading={fetchingUser}
    />
  );
};
