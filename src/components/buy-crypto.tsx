import { Button, ButtonProps } from 'components/button';
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
  theme?: ButtonProps['theme'];
}

export const BuyCrypto: FC<Props> = ({ buttonProps = {}, theme = 'light' }) => {
  const { openOnrampWindow } = useOnramp();

  return (
    <Button {...buttonProps} theme={theme} onClick={openOnrampWindow}>
      Buy Crypto
    </Button>
  );
};
