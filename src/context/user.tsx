import { createContext, ReactNode, useState } from 'react';
import { SWRConfig } from 'swr';
import { FractalUser } from 'types/user';
import { FractalUserWallet } from 'types/user-wallet';

interface UserContextState {
  fractalUser?: FractalUser;
  fractalUserWallet?: FractalUserWallet;
  setFractalUser: (user: FractalUser | undefined) => void;
  setFractalUserWallet: (userWallet: FractalUserWallet | undefined) => void;
}

export const UserContext = createContext<UserContextState>({
  fractalUser: undefined,
  fractalUserWallet: undefined,
  setFractalUser: () => undefined,
  setFractalUserWallet: () => undefined,
});

export interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [fractalUser, setFractalUser] = useState<FractalUser | undefined>(
    undefined,
  );
  const [fractalUserWallet, setFractalUserWallet] = useState<
    FractalUserWallet | undefined
  >(undefined);

  return (
    <UserContext.Provider
      value={{
        fractalUser,
        fractalUserWallet,
        setFractalUser,
        setFractalUserWallet,
      }}
    >
      <SWRConfig>{children}</SWRConfig>
    </UserContext.Provider>
  );
}
