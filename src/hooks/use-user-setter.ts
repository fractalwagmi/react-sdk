import { UserContext } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { useCallback, useContext } from 'react';
import { UserWallet, BaseUser, User } from 'types';

export const useUserSetter = () => {
  const { setUser, setUserWallet } = useContext(UserContext);

  const fetchAndSetUser = useCallback(async (baseUser: BaseUser) => {
    const { data } = await sdkApiClient.v1.getInfo({
      headers: maybeIncludeAuthorizationHeaders(
        baseUser.accessToken,
        Endpoint.GET_INFO,
      ),
    });

    const user: User = {
      ...baseUser,
      email: data.email,
      username: data.username,
    };
    const userWallet: UserWallet = {
      solanaPublicKeys: data.accountPublicKey ? [data.accountPublicKey] : [],
    };

    setUser(user);
    setUserWallet(userWallet);

    return {
      user,
      userWallet,
    };
  }, []);

  return {
    fetchAndSetUser,
  };
};
