export const POPUP_WIDTH_PX = 400;
export const POPUP_HEIGHT_PX = 600;

const TARGET = 'fractal:approval:popup';
const STATIC_POPUP_FEATURES = ['resizable', 'scrollbars=1', 'status=1'];

interface OpenPopupParams {
  height?: number;
  left?: number;
  /** Visible for testing. */
  scope?: Window;
  top?: number;
  url: string;
  width?: number;
}

export function openPopup({
  left = 0,
  scope = window,
  top = 0,
  width = POPUP_WIDTH_PX,
  height = POPUP_HEIGHT_PX,
  url,
}: OpenPopupParams): Window | null {
  return scope.open(
    url,
    TARGET,
    getPopupFeatures({ height, left, top, width }),
  );
}

interface GetPopupFeaturesParams {
  height: number;
  left: number;
  top: number;
  width: number;
}

function getPopupFeatures({
  height,
  left,
  top,
  width,
}: GetPopupFeaturesParams) {
  return [
    'popup',
    `left=${left}`,
    `top=${top}`,
    `width=${width}`,
    `height=${height}`,
    ...STATIC_POPUP_FEATURES,
  ].join(',');
}
