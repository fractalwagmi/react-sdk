import { FractalSDKContext } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import { storeIdAndTokenInLS } from 'core/token';
import { useCallback, useContext } from 'react';
import { UserWallet, BaseUser, User } from 'types';

export const useUserSetter = () => {
  const { setUser, setUserWallet } = useContext(FractalSDKContext);

  const fetchAndSetUser = useCallback(
    async (baseUser: BaseUser, accessToken: string) => {
      const { data } = await sdkApiClient.v1.getInfo();

      const user: User = {
        ...baseUser,
        email: data.email,
        username: data.username,
      };
      const userWallet: UserWallet = {
        solanaPublicKeys: data.accountPublicKey ? [data.accountPublicKey] : [],
      };

      storeIdAndTokenInLS({
        accessToken,
        userId: user.userId,
      });
      setUser(user);
      setUserWallet(userWallet);

      return {
        user,
        userWallet,
      };
    },
    [],
  );

  return {
    fetchAndSetUser,
  };
};
