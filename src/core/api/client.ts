import { Api as AuthApi } from '@fractalwagmi/fractal-auth-api';
import { Api as SdkApi } from '@fractalwagmi/fractal-sdk-api';

export const AUTH_API_ROOT_URL = 'https://auth-api.fractal.is';
export const SDK_API_ROOT_URL = 'https://api.fractal.is';

export const authApiClient = new AuthApi({
  baseUrl: AUTH_API_ROOT_URL,
});

export const sdkApiClient = new SdkApi({
  baseUrl: SDK_API_ROOT_URL,
});
