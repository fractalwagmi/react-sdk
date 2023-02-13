import { Api as PrivateWebSdkApi } from '@fractalwagmi/fractal-auth-private-web-sdk-api';
import { Api as SdkApi } from '@fractalwagmi/fractal-sdk-public-api';
import { Api as WebSdkApi } from '@fractalwagmi/fractal-sdk-websdk-api';
import { Api as AuthApi } from '@fractalwagmi/ts-auth-api';
import { getDefaultHeaders, getDefaultSecureHeaders } from 'core/api/headers';

export const AUTH_API_ROOT_URL = 'https://auth-api.fractal.is';
export const SDK_API_ROOT_URL = 'https://api.fractal.is';

export const authApiClient = new AuthApi({
  baseApiParams: {
    headers: getDefaultHeaders(),
  },
  baseUrl: AUTH_API_ROOT_URL,
  securityWorker: () => ({
    headers: getDefaultSecureHeaders(),
  }),
});

export const sdkApiClient = new SdkApi({
  baseApiParams: {
    headers: getDefaultHeaders(),
  },
  baseUrl: SDK_API_ROOT_URL,
  securityWorker: () => ({
    headers: getDefaultSecureHeaders(),
  }),
});

export const authPrivateWebSdkApiClient = new PrivateWebSdkApi({
  baseApiParams: {
    headers: getDefaultHeaders(),
  },
  baseUrl: AUTH_API_ROOT_URL,
  securityWorker: () => ({
    headers: getDefaultSecureHeaders(),
  }),
});

export const webSdkApiClient = new WebSdkApi({
  baseApiParams: {
    headers: getDefaultHeaders(),
  },
  baseUrl: SDK_API_ROOT_URL,
  securityWorker: () => ({
    headers: getDefaultSecureHeaders(),
  }),
});
