import { SignInButton, SignInButtonProps } from 'components/sign-in-button';
import { useAuthUrl } from 'hooks/use-auth-url';
import { useSignIn } from 'hooks/use-sign-in';
import React, { HTMLAttributes } from 'react';
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
  onError,
  onSuccess,
  scopes,
  variant = 'light',
}: SignInProps) => {
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

  if (component) {
    return React.cloneElement(component, {
      onClick: signIn,
    });
  }

  return <SignInButton variant={variant} onClick={signIn} {...buttonProps} />;
};
