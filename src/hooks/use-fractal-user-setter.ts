import { UserContext } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';
import { useCallback, useContext } from 'react';
import { BaseUser, FractalUser } from 'types/user';

export const useFractalUserSetter = () => {
  const { setFractalUser } = useContext(UserContext);

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
    setFractalUser(fractalUser);
    return fractalUser;
  }, []);

  return {
    fetchAndSetFractalUser,
  };
};
