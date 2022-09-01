import { clearIdAndTokenInLS } from 'core/token';
import { createContext, useCallback, useState } from 'react';
import { User, UserWallet } from 'types';

interface FractalSDKContextState {
  clientId: string;
  onResetUser: (resetHandler: () => void) => void;
  resetUser: () => void;
  setUser: (user: User | undefined) => void;
  setUserWallet: (userWallet: UserWallet | undefined) => void;
  user?: User;
  userWallet?: UserWallet;
}

export const FractalSDKContext = createContext<FractalSDKContextState>({
  clientId: '',
  onResetUser: () => undefined,
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
  const [resetHandlers, setResetHandlers] = useState<Set<() => void>>(
    () => new Set(),
  );
  const resetUser = useCallback(() => {
    clearIdAndTokenInLS();
    setUser(undefined);
    setUserWallet(undefined);
    for (const handler of resetHandlers) {
      handler();
    }
  }, [resetHandlers]);

  const onResetUser = useCallback((handleOnResetUser: () => void) => {
    setResetHandlers(handlers => new Set([...handlers]).add(handleOnResetUser));
  }, []);

  return (
    <FractalSDKContext.Provider
      value={{
        clientId,
        onResetUser,
        resetUser,
        setUser,
        setUserWallet,
        user,
        userWallet,
      }}
    >
      {children}
    </FractalSDKContext.Provider>
  );
}
