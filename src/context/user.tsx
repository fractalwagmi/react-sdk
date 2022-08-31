import { clearIdAndTokenInLS } from 'core/token';
import { createContext, useCallback, useState } from 'react';
import { User, UserWallet } from 'types';

interface UserContextState {
  resetUser: () => void;
  setUser: (user: User | undefined) => void;
  setUserWallet: (userWallet: UserWallet | undefined) => void;
  user?: User;
  userWallet?: UserWallet;
}

export const UserContext = createContext<UserContextState>({
  resetUser: () => undefined,
  setUser: () => undefined,
  setUserWallet: () => undefined,
  user: undefined,
  userWallet: undefined,
});

export type UserContextProviderProps = React.PropsWithChildren<
  Record<never, never>
>;

export function UserContextProvider({ children }: UserContextProviderProps) {
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
    <UserContext.Provider
      value={{
        resetUser,
        setUser,
        setUserWallet,
        user,
        userWallet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
