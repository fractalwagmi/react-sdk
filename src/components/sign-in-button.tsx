import { css } from '@emotion/css';
import { Logo } from 'components/logo';
import { HTMLAttributes } from 'react';

const DEFAULT_BUTTON_TEXT = 'Sign in with';

export const SignInButton = (
  buttonProps: HTMLAttributes<HTMLButtonElement>,
) => {
  const className = [
    css(`
      align-items: baseline;
      background: #f2059f;
      border-radius: 0.25rem;
      border: 0;
      color: #fff;
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      font-weight: 500;
      gap: 0.375em;
      justify-content: center;
      padding: 0.75rem 1rem;
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
      <span
        className={css`
          white-space: nowrap;
        `}
      >
        {DEFAULT_BUTTON_TEXT}
      </span>
      <Logo />
    </button>
  );
};
