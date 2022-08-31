import { FractalSDKContext } from 'context/fractal-sdk-context';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useContext } from 'react';
import { User } from 'types';

export const useUser = (): Omit<
  PublicDataHookResponse<User | undefined>,
  'error' | 'refetch'
> => {
  const { user } = useContext(FractalSDKContext);
  return { data: user };
};
