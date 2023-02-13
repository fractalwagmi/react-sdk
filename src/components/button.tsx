import { css, cx } from '@emotion/css';
import { FractalFLogo } from 'components/fractal-f-logo';
import { getDefaultButtonStyles } from 'components/styles';
import { assertUnreachable } from 'lib/assertions';
import { FC } from 'react';

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> {
  onClick: () => void;
  theme: 'light' | 'dark';
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  theme,
  ...buttonProps
}) => {
  const {
    buttonBackground,
    buttonBackgroundOnHover,
    logoBackground,
    logoFill,
    textColor,
  } = getColorsFromVariant(theme);

  const defaultButtonStyles = getDefaultButtonStyles({
    buttonBackground,
    buttonBackgroundOnHover,
    textColor,
  });

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
        {children}
      </div>
    </button>
  );
};

function getColorsFromVariant(variant: ButtonProps['theme']) {
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
    default:
      assertUnreachable(variant);
  }
}
