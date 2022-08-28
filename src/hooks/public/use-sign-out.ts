import { FractalSDKContext } from 'context/fractal-sdk-context';
import { useContext } from 'react';

export const useSignOut = () => {
  const { resetUser } = useContext(FractalSDKContext);

  return {
    signOut: resetUser,
  };
};
