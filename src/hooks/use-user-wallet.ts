import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useUserWallet = () => {
  const { fractalUserWallet } = useContext(UserContext);
  return { fractalUserWallet };
};
