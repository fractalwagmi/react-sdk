import { Button, ButtonProps } from 'components/button';
import { HeadlessAuthButtonProps } from 'hooks/public/use-auth-button-props';

const LOADING_TEXT = 'Loading...';
const DEFAULT_SIGN_IN_BUTTON_TEXT = 'Sign in with Fractal';
const DEFAULT_SIGN_OUT_BUTTON_TEXT = 'Sign out';

export interface AuthButtonProps
  extends HeadlessAuthButtonProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> {
  variant: ButtonProps['theme'];
}

export const AuthButton = ({
  loading = false,
  onClick,
  signedIn,
  variant,
  ...buttonProps
}: AuthButtonProps) => {
  const buttonText = signedIn
    ? DEFAULT_SIGN_OUT_BUTTON_TEXT
    : DEFAULT_SIGN_IN_BUTTON_TEXT;

  return (
    <Button {...buttonProps} onClick={onClick} theme={variant}>
      {loading ? LOADING_TEXT : buttonText}
    </Button>
  );
};
