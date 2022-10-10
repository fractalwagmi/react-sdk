import { FractalAuthPrivateWebSdkGetApprovalUrlResponse } from '@fractalwagmi/fractal-auth-private-web-sdk-api';
import { useMutation } from '@tanstack/react-query';
import { authPrivateWebSdkApiClient } from 'core/api/client';
import { ApiFeature } from 'core/api/types';
import { FractalSDKAuthenticationUnknownError } from 'core/error';
import { Scope } from 'types';

const DEFAULT_SCOPE = [Scope.IDENTIFY];

enum AuthApiKey {
  GET_APPROVAL_URL = 'GET_APPROVAL_URL',
}

export const AuthApiKeys = {
  getAuthUrl: (clientId: string, scopes: Scope[]) =>
    [ApiFeature.COINS, AuthApiKey.GET_APPROVAL_URL, clientId, scopes] as const,
};

export const useGetAuthUrlMutation = (
  clientId: string,
  scopes: Scope[] = DEFAULT_SCOPE,
) => {
  return useMutation(AuthApiKeys.getAuthUrl(clientId, scopes), async () =>
    AuthApi.getAuthUrl(clientId, scopes),
  );
};

const AuthApi = {
  getAuthUrl,
};

async function getAuthUrl(
  clientId: string,
  scopes: Scope[],
): Promise<FractalAuthPrivateWebSdkGetApprovalUrlResponse> {
  const response =
    await authPrivateWebSdkApiClient.privateWebSdk.getApprovalUrl({
      clientId,
      scope: scopes,
    });
  if (response.error) {
    throw new FractalSDKAuthenticationUnknownError(
      `There was an issue generating the approval url. error = ${response.error.message}`,
    );
  }
  return response.data;
}
