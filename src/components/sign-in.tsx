import { SignInButton, SignInButtonProps } from 'components/sign-in-button';
import { maybeGetBaseUserFromLS } from 'core/token';
import { useUser, useUserSetter } from 'hooks';
import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import React, { HTMLAttributes, useEffect, useState } from 'react';
import { Scope, User } from 'types';

export interface SignInProps {
  /**
   * Any additional props for <button> that should be passed to the default
   * sign-in button.
   */
  buttonProps: HTMLAttributes<HTMLButtonElement>;
  clientId: string;
  /** Optional component to render instead of the default sign-in button. */
  component?: React.ReactElement;
  /** Whether to hide the sign in button when logged in or not. Defaults to `true`. */
  hideWhenSignedIn?: boolean;
  onError?: (e: unknown) => void;
  onSuccess?: (user: User) => void;
  /**
   * The scopes to assign to the access token. Defaults to [Scope.IDENTIFY].
   *
   * See src/types/scope.ts for a list of available scopes.
   */
  scopes?: Scope[];
  /**
   * The button style variant to use.
   *
   * Possible values: 'light' | 'dark'. Defaults to 'light'.
   */
  variant?: SignInButtonProps['variant'];
}

export const SignIn = ({
  buttonProps,
  clientId,
  component,
  hideWhenSignedIn = true,
  onError,
  onSuccess,
  scopes,
  variant = 'light',
}: SignInProps) => {
  const { data: user } = useUser();
  const [fetchingUser, setFetchingUser] = useState(false);
  const { fetchAndSetUser } = useUserSetter();

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

  useEffect(() => {
    const baseUserFromLS = maybeGetBaseUserFromLS();
    const isAlreadyLoggedIn = Boolean(user);
    if (isAlreadyLoggedIn || !baseUserFromLS || fetchingUser) {
      return;
    }

    const refreshUser = async () => {
      await fetchAndSetUser(baseUserFromLS);
      setFetchingUser(false);
    };

    setFetchingUser(true);
    refreshUser();
  }, [user, fetchingUser]);

  if (user && hideWhenSignedIn) {
    return null;
  }

  if (component) {
    return React.cloneElement(component, {
      onClick: signIn,
    });
  }

  return (
    <SignInButton
      variant={variant}
      onClick={signIn}
      {...buttonProps}
      loading={fetchingUser}
    />
  );
};
