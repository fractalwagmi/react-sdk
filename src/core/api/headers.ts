import { CURRENT_SDK_VERSION } from 'config/build-variables';
import { FractalSDKAuthenticationError } from 'core/error';
import { maybeGetAccessToken } from 'core/token';

enum CustomHeader {
  FRACTAL_WEB_SDK_VERSION = 'fractal-web-sdk-version',
}

export function getDefaultSecureHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  const accessToken = maybeGetAccessToken();
  if (!accessToken) {
    throw new FractalSDKAuthenticationError('Missing access token');
  }

  return {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  };
}

export function getDefaultHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    ...headers,
    [CustomHeader.FRACTAL_WEB_SDK_VERSION]: CURRENT_SDK_VERSION,
  };
}
