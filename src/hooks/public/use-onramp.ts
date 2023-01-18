import { Platform, usePopupConnection } from '@fractalwagmi/popup-connection';
import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useCallback, useContext } from 'react';

const ONRAMP_URL = 'https://fractal.is/onramp';
const POPUP_HEIGHT_PX = 800;

export const useOnramp = () => {
  const { clientId, user } = useContext(FractalSDKContext);
  const {
    // close: closePopup,
    // connection,
    open: openPopup,
  } = usePopupConnection({
    enabled: !user,
    heightPx: POPUP_HEIGHT_PX,
    platform: Platform.REACT_SDK,
  });

  const openOnrampWindow = useCallback(() => {
    openPopup(`${ONRAMP_URL}?clientId=${clientId}`);
  }, []);

  return { openOnrampWindow };
};
