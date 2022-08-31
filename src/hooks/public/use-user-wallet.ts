import { FractalSDKContext } from 'context/fractal-sdk-context';
import { PublicDataHookResponse } from 'hooks/public/types';
import { useContext } from 'react';
import { UserWallet } from 'types';

export const useUserWallet = (): Omit<
  PublicDataHookResponse<UserWallet | undefined>,
  'error' | 'refetch'
> => {
  const { userWallet } = useContext(FractalSDKContext);
  return { data: userWallet };
};
