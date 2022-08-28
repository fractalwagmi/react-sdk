import { css, cx } from '@emotion/css';
import { FractalFLogo } from 'components/fractal-f-logo';
import { getDefaultButtonStyles } from 'components/styles';

const LOADING_TEXT = 'Loading...';

export interface AuthButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  buttonText: string;
  loading?: boolean;
  variant?: 'light' | 'dark';
}

export const AuthButton = ({
  buttonText,
  loading = false,
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

  return (
    <button
      {...buttonProps}
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
