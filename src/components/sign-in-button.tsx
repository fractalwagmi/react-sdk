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
      background: #f2059f;
      border-radius: 0.25rem;
      border: 0;
      color: #fff;
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      gap: 0.625rem;
      padding: 0.125rem 0.75rem 0.125rem 0.125rem;
      width: max-content;

      &:hover {
        background: #ff3dbb;
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
          background: #fff;
          width: 2rem;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.5px;
        `}
      >
        <Logo></Logo>
      </div>
      <span
        className={css`
          white-space: nowrap;
        `}
      >
        {DEFAULT_BUTTON_TEXT}
      </span>
    </button>
  );
};
