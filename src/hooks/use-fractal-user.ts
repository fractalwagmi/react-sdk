import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useFractalUser = () => {
  const { fractalUser } = useContext(UserContext);
  return { fractalUser };
};
