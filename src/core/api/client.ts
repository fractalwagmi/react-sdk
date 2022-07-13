import { Api as AuthApi } from '@fractalwagmi/fractal-auth-api';

export const AUTH_API_ROOT_URL = 'https://auth-api.fractal.is';

export const authApiClient = new AuthApi({
  baseUrl: AUTH_API_ROOT_URL,
});
