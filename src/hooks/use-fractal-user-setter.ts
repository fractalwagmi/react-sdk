import { UserContext } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { useCallback, useContext } from 'react';
import { BaseUser, FractalUser } from 'types/user';
import { FractalUserWallet } from 'types/user-wallet';

export const useFractalUserSetter = () => {
  const { setFractalUser, setFractalUserWallet } = useContext(UserContext);

  const fetchAndSetFractalUser = useCallback(async (baseUser: BaseUser) => {
    const { data } = await sdkApiClient.v1.getInfo({
      headers: maybeIncludeAuthorizationHeaders(
        baseUser.accessToken,
        sdkApiClient.v1.getInfo,
      ),
    });

    const fractalUser: FractalUser = {
      ...baseUser,
      email: data.email,
      username: data.username,
    };
    const fractalUserWallet: FractalUserWallet = {
      solanaPublicKeys: data.accountPublicKey ? [data.accountPublicKey] : [],
    };
    setFractalUser(fractalUser);
    setFractalUserWallet(fractalUserWallet);

    return {
      fractalUser,
      fractalUserWallet,
    };
  }, []);

  return {
    fetchAndSetFractalUser,
  };
};
