import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useFractalUserWallet = () => {
  const { fractalUserWallet } = useContext(UserContext);
  return { fractalUserWallet };
};
