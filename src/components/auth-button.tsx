import { css, cx } from '@emotion/css';
import { FractalFLogo } from 'components/fractal-f-logo';
import { getDefaultButtonStyles } from 'components/styles';
import { HeadlessAuthButtonProps } from 'hooks/public/use-auth-button-props';

const LOADING_TEXT = 'Loading...';
const DEFAULT_SIGN_IN_BUTTON_TEXT = 'Sign in with Fractal';
const DEFAULT_SIGN_OUT_BUTTON_TEXT = 'Sign out';

export interface AuthButtonProps
  extends HeadlessAuthButtonProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> {
  variant?: 'light' | 'dark';
}

export const AuthButton = ({
  loading = false,
  onClick,
  signedIn,
  variant,
  ...buttonProps
}: AuthButtonProps) => {
  const {
    buttonBackground,
    buttonBackgroundOnHover,
    logoBackground,
    logoFill,
    textColor,
  } = getColorsFromVariant(variant);

  const defaultButtonStyles = getDefaultButtonStyles({
    buttonBackground,
    buttonBackgroundOnHover,
    textColor,
  });

  const buttonText = signedIn
    ? DEFAULT_SIGN_OUT_BUTTON_TEXT
    : DEFAULT_SIGN_IN_BUTTON_TEXT;

  return (
    <button
      {...buttonProps}
      onClick={onClick}
      className={cx(defaultButtonStyles, buttonProps.className)}
    >
      <div
        className={css`
          height: 2.25rem;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${logoBackground};
          border-radius: 0.125rem;
        `}
      >
        <FractalFLogo fill={logoFill}></FractalFLogo>
      </div>
      <div
        className={css`
          padding: 0 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        `}
      >
        {loading ? LOADING_TEXT : buttonText}
      </div>
    </button>
  );
};

function getColorsFromVariant(variant: AuthButtonProps['variant'] = 'dark') {
  switch (variant) {
    case 'light':
      return {
        buttonBackground: '#c31a88',
        buttonBackgroundOnHover: '#d71d96',
        logoBackground: '#f2059f',
        logoFill: '#fff',
        textColor: '#fff',
      };
    case 'dark':
      return {
        buttonBackground: '#000',
        buttonBackgroundOnHover: '#181818',
        logoBackground: '#232323',
        logoFill: '#f2059f',
        textColor: '#fff',
      };
  }
}
