import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useContext } from 'react';

export const useLogout = () => {
  const { resetUser } = useContext(FractalSDKContext);

  return {
    logout: resetUser,
  };
};
