import { UserContext } from 'components/wallet';
import { useContext } from 'react';

export const useFractalUser = () => {
  return useContext(UserContext).user;
};
