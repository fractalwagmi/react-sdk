import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clearIdAndTokenInLS } from 'core/token';
import { createContext, useCallback, useState } from 'react';
import { User, UserWallet } from 'types';

const queryClient = new QueryClient();

interface FractalSDKContextState {
  clientId: string;
  resetUser: () => void;
  setUser: (user: User | undefined) => void;
  setUserWallet: (userWallet: UserWallet | undefined) => void;
  user?: User;
  userWallet?: UserWallet;
}

export const FractalSDKContext = createContext<FractalSDKContextState>({
  clientId: '',
  resetUser: () => undefined,
  setUser: () => undefined,
  setUserWallet: () => undefined,
  user: undefined,
  userWallet: undefined,
});

export interface FractalSDKContextProviderProps
  extends React.PropsWithChildren<Record<never, never>> {
  clientId: string;
}

export function FractalSDKContextProvider({
  children,
  clientId,
}: FractalSDKContextProviderProps) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [userWallet, setUserWallet] = useState<UserWallet | undefined>(
    undefined,
  );
  const resetUser = useCallback(() => {
    clearIdAndTokenInLS();
    setUser(undefined);
    setUserWallet(undefined);
  }, []);

  return (
    <FractalSDKContext.Provider
      value={{
        clientId,
        resetUser,
        setUser,
        setUserWallet,
        user,
        userWallet,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </FractalSDKContext.Provider>
  );
}
