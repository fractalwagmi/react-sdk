import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { UserContext } from 'components/wallet';
import { ENDPOINTS } from 'core/endpoints';
import { useContext } from 'react';
import useSWR from 'swr';

export interface BalanceResponse {
  /** Balance in lamports */
  balance?: number;
  error?: Error;
  isLoading: boolean;
}

export const useSolBalance = (): BalanceResponse | undefined => {
  const user = useContext(UserContext);
  const { connection } = useConnection();
  const { data: balance, error } = useSWR(ENDPOINTS.SOL_BALANCE, () => {
    if (!user) {
      return;
    }
    return getSolBalance(connection, new PublicKey(user.publicKey));
  });

  if (!user) {
    return;
  }

  return {
    balance,
    error,
    isLoading: !balance && !error,
  };
};

const getSolBalance = async (
  connection: Connection,
  publicKey: PublicKey,
): Promise<number | undefined> => {
  const accountInfo = await connection.getAccountInfo(publicKey, 'confirmed');
  return accountInfo?.lamports;
};
