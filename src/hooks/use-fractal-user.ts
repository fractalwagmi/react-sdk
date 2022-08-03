import { UserContext } from 'context/user';
import { useContext } from 'react';
import { FractalUser } from 'types/user';

interface FractalUserHookReturnValue {
  fractalUser?: FractalUser;
}

export const useFractalUser = (): FractalUserHookReturnValue => {
  const { fractalUser } = useContext(UserContext);
  return { fractalUser };
};
