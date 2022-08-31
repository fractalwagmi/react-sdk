import { FractalSDKContext } from 'context/fractal-sdk-context';
import { PublicHookResponse } from 'hooks/public/types';
import { useContext } from 'react';
import { User } from 'types';

export const useUser = (): Omit<
  PublicHookResponse<User | undefined>,
  'error' | 'refetch'
> => {
  const { user } = useContext(FractalSDKContext);
  return { data: user };
};
