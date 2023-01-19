import { Platform, usePopupConnection } from '@fractalwagmi/popup-connection';
import { ButtonProps } from 'components/button';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useCallback, useContext } from 'react';

const ONRAMP_URL = 'https://fractal.is/onramp';
const POPUP_HEIGHT_PX = 672;

interface UseOnrampOptions {
  theme?: ButtonProps['theme'];
}

export const useOnramp = (options?: UseOnrampOptions) => {
  const { theme } = options ?? { theme: 'light' };
  const { clientId, user } = useContext(FractalSDKContext);
  const { open: openPopup } = usePopupConnection({
    enabled: !user,
    heightPx: POPUP_HEIGHT_PX,
    platform: Platform.REACT_SDK,
  });

  const openOnrampWindow = useCallback(() => {
    openPopup(`${ONRAMP_URL}?clientId=${clientId}&theme=${theme}`);
  }, []);

  return { openOnrampWindow };
};
