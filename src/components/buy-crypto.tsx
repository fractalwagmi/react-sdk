import { Button, ButtonProps } from 'components/button';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useOnramp, UseOnrampOptions } from 'hooks';
import { FC, HTMLAttributes, useContext } from 'react';

interface Props extends UseOnrampOptions {
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

export const BuyCrypto: FC<Props> = ({
  buttonProps = {},
  theme = 'light',
  onRejected,
  onFulfillmentComplete,
}) => {
  const { user } = useContext(FractalSDKContext);
  const { openOnrampWindow } = useOnramp({
    onFulfillmentComplete,
    onRejected,
    theme,
  });

  if (!user) {
    return null;
  }

  return (
    <Button {...buttonProps} theme={theme} onClick={openOnrampWindow}>
      Buy Crypto
    </Button>
  );
};
