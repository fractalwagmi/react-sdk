import { AuthButton, AuthButtonProps } from 'components/auth-button';
import {
  UseAuthButtonPropsParameters,
  useAuthButtonProps,
} from 'hooks/public/use-auth-button-props';
import React, { HTMLAttributes } from 'react';

export interface SignInProps extends UseAuthButtonPropsParameters {
  /**
   * Any additional props for <button> that should be passed to the default
   * sign-in button.
   */
  buttonProps?: HTMLAttributes<HTMLButtonElement>;
  /**
   * The button style variant to use.
   *
   * Possible values: 'light' | 'dark'. Defaults to 'light'.
   */
  variant?: AuthButtonProps['variant'];
}

export const SignIn = ({
  buttonProps = {},
  onError,
  onSuccess,
  onSignOut,
  scopes,
  variant = 'light',
}: SignInProps) => {
  const { loading, onClick, signedIn } = useAuthButtonProps({
    onError,
    onSignOut,
    onSuccess,
    scopes,
  });

  return (
    <AuthButton
      variant={variant}
      signedIn={signedIn}
      loading={loading}
      {...buttonProps}
      // `onClick` needs to come after {...buttonProps} because the type of
      // the `onClick` prop are inconsistent. We intentionally use () => void
      // as opposed to the event handler type since the SDK caller may want to
      // attach the `onClick` handler on something other than a button, or may
      // just end up programatically calling it in some way where they don't
      // have the ability to pass in the appropriately typed `event` as the
      // argument.
      onClick={onClick}
    />
  );
};
