import { UserContext } from 'context/user';
import { useContext } from 'react';

export const useLogout = () => {
  const { resetUser } = useContext(UserContext);

  return {
    logout: resetUser,
  };
};
