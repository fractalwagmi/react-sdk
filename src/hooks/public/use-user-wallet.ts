import { UserContext } from 'context/user';
import { PublicHookResponse } from 'hooks/public/types';
import { useContext } from 'react';
import { UserWallet } from 'types';

export const useUserWallet = (): Omit<
  PublicHookResponse<UserWallet | undefined>,
  'error' | 'refetch'
> => {
  const { userWallet } = useContext(UserContext);
  return { data: userWallet };
};
