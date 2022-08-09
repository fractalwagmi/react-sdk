import { css } from '@emotion/css';
import { Logo } from 'components/logo';
import { HTMLAttributes } from 'react';

const DEFAULT_BUTTON_TEXT = 'Sign in with Fractal';

export interface SignInButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark';
}

export const SignInButton = ({
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

  const className = [
    css(`
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
    `),
    buttonProps.className ?? '',
  ]
    .join(' ')
    .trim();

  return (
    <button {...buttonProps} className={className}>
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
        <Logo fill={logoFill}></Logo>
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
        {DEFAULT_BUTTON_TEXT}
      </div>
    </button>
  );
};

function getColorsFromVariant(variant: SignInButtonProps['variant']) {
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
    default:
      return {
        buttonBackground: '#000',
        buttonBackgroundHover: '#181818',
        logoBackground: '#232323',
        logoFill: '#f2059f',
        textColor: '#fff',
      };
  }
}
