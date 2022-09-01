import { FractalSDKContext } from 'context/fractal-sdk-context';
import { authPrivateWebSdkApiClient } from 'core/api/client';
import { FractalSDKError } from 'core/error';
import { verifyScopes } from 'core/scope';
import { getCurrentOrigin } from 'lib/util/origin';
import { useContext, useEffect, useState } from 'react';
import { Scope } from 'types';

const DEFAULT_SCOPE = [Scope.IDENTIFY];

interface UseAuthUrlParameters {
  clientId: string;
  onError: (e: FractalSDKError) => void;
  scopes?: Scope[];
}

export const useAuthUrl = ({
  clientId,
  onError,
  scopes = DEFAULT_SCOPE,
}: UseAuthUrlParameters) => {
  const { user } = useContext(FractalSDKContext);
  const [url, setUrl] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  if (!verifyScopes(scopes)) {
    // eslint-disable-next-line no-console
    console.error(
      'Invalid scopes. Be sure to pass in at least one of the values from ' +
        'types/scope.ts. Defaulting to `[Scope.IDENTIFY]`.',
    );
    scopes = DEFAULT_SCOPE;
  }

  useEffect(() => {
    const getUrl = async () => {
      try {
        const urlInfo = (
          await authPrivateWebSdkApiClient.privateWebSdk.getApprovalUrl({
            clientId,
            origin: getCurrentOrigin(),
            scope: scopes,
          })
        ).data;
        setUrl(urlInfo.url);
        setCode(urlInfo.code);
      } catch (e: unknown) {
        // TODO: Add sentry integration.
        onError(new FractalSDKError('Unable to retrieve auth URL'));
      }
    };
    getUrl();
  }, [
    // Making this effect depend on `user` ensures we re-fetch for the approval
    // url when a user object is mutated (signed out and sign back in, for
    // example).
    user,
  ]);

  return {
    code,
    url,
  };
};
