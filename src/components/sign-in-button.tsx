import { css } from '@emotion/css';
import { HTMLAttributes } from 'react';

export const DEFAULT_BUTTON_TEXT = 'Sign in with Fractal';

export const SignInButton = (
  buttonProps: HTMLAttributes<HTMLButtonElement>,
) => {
  const className = [
    css`
      &:hover {
        background: #ff3dbb;
      }
      cursor: pointer;
      border: 0;
      background: #f2059f;
      border-radius: 4px;
      color: #fff;
      padding: 0.75rem 1rem;
      font-size: 1rem;
    `,
    buttonProps.className ?? '',
  ]
    .join(' ')
    .trim();
  return (
    <button {...buttonProps} className={className}>
      {DEFAULT_BUTTON_TEXT}
    </button>
  );
};
