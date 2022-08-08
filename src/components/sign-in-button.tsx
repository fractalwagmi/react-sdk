import { css } from '@emotion/css';
import { Logo } from 'components/logo';
import { HTMLAttributes } from 'react';

const DEFAULT_BUTTON_TEXT = 'Sign in with Fractal';

export const SignInButton = (
  buttonProps: HTMLAttributes<HTMLButtonElement>,
) => {
  const className = [
    css(`
      align-items: center;
      background: #d71d96;
      border-radius: 0.25rem;
      border: 0;
      color: #fff;
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      padding: 0.1875rem;
      width: max-content;

      &:hover {
        background: #c31a88;
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
          background: #f2059f;
          border-radius: 0.125rem;
        `}
      >
        <Logo></Logo>
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
