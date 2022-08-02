import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useFractalUser = () => {
  return useContext(UserContext).user;
};
