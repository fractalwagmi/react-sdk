import { UserContext } from 'context/user';
import { PublicHookResponse } from 'hooks/public/types';
import { useContext } from 'react';
import { User } from 'types';

export const useUser = (): Omit<
  PublicHookResponse<User | undefined>,
  'error' | 'refetch'
> => {
  const { user } = useContext(UserContext);
  return { data: user };
};
