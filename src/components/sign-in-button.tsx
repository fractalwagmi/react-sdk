import { css, cx } from '@emotion/css';
import { FractalFLogo } from 'components/fractal-f-logo';
import { HTMLAttributes } from 'react';

const DEFAULT_BUTTON_TEXT = 'Sign in with Fractal';
const LOADING_TEXT = 'Loading...';

export interface SignInButtonProps extends HTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'light' | 'dark';
}

export const SignInButton = ({
  loading = false,
  variant,
  ...buttonProps
}: SignInButtonProps) => {
  const {
    buttonBackground,
    buttonBackgroundHover,
    logoBackground,
    logoFill,
    textColor,
  } = getColorsFromVariant(variant);

  const defaultButtonStyles = css(`
  align-items: center;
  background: ${buttonBackground};
  border-radius: 0.25rem;
  border: 0;
  color: ${textColor};
  cursor: pointer;
  display: flex;
  font-family: "Quattrocento Sans", sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.02857em;
  padding: 0.1875rem;
  text-transform: uppercase;
  width: max-content;

  &:hover {
    background: ${buttonBackgroundHover};
  }
`);

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
        {loading ? LOADING_TEXT : DEFAULT_BUTTON_TEXT}
      </div>
    </button>
  );
};

function getColorsFromVariant(variant: SignInButtonProps['variant'] = 'dark') {
  switch (variant) {
    case 'light':
      return {
        buttonBackground: '#c31a88',
        buttonBackgroundHover: '#d71d96',
        logoBackground: '#f2059f',
        logoFill: '#fff',
        textColor: '#fff',
      };
    case 'dark':
      return {
        buttonBackground: '#000',
        buttonBackgroundHover: '#181818',
        logoBackground: '#232323',
        logoFill: '#f2059f',
        textColor: '#fff',
      };
  }
}
