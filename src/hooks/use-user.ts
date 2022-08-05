import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useUser = () => {
  const { fractalUser } = useContext(UserContext);
  return { fractalUser };
};
