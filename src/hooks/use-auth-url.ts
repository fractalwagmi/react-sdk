import { authApiClient } from 'core/api/client';
import { verifyScopes } from 'core/scope';
import { useEffect, useState } from 'react';
import { Scope } from 'types/scope';

const DEFAULT_SCOPE = [Scope.IDENTIFY];

interface UseAuthUrlParameters {
  clientId: string;
  onError: () => void;
  scopes?: Scope[];
}

export const useAuthUrl = ({
  clientId,
  onError,
  scopes = DEFAULT_SCOPE,
}: UseAuthUrlParameters) => {
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
          await authApiClient.v2.getUrl({
            clientId,
            scope: scopes,
          })
        ).data;
        setUrl(urlInfo.url);
        setCode(urlInfo.code);
      } catch {
        onError();
      }
    };
    getUrl();
  }, []);

  return {
    code,
    url,
  };
};
