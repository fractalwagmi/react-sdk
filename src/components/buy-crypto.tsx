import { css, cx } from '@emotion/css';
import { AuthButtonProps } from 'components/auth-button';
import { FractalFLogo } from 'components/fractal-f-logo';
import { getDefaultButtonStyles } from 'components/styles';
import { useOnramp } from 'hooks';
import { FC, HTMLAttributes } from 'react';

interface Props {
  /**
   * Any additional props for <button> that should be passed to the default
   * sign-in button.
   */
  buttonProps?: HTMLAttributes<HTMLButtonElement>;
  /**
   * The button style variant to use.
   *
   * Possible values: 'light' | 'dark'. Defaults to 'light'.
   */
  variant?: AuthButtonProps['variant'];
}

export const BuyCrypto: FC<Props> = ({ buttonProps = {}, variant }) => {
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

  const { openOnrampWindow } = useOnramp();

  return (
    <button
      {...buttonProps}
      onClick={openOnrampWindow}
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
        Buy Crypto
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
