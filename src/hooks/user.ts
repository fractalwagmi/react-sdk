import { UserContext } from 'components/sign-in';
import { useContext } from 'react';

export const useFractalUser = () => {
  return useContext(UserContext).user;
};
