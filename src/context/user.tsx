import { createContext, useState } from 'react';
import { SWRConfig } from 'swr';
import { User, UserWallet } from 'types';

interface UserContextState {
  setUser: (user: User | undefined) => void;
  setUserWallet: (userWallet: UserWallet | undefined) => void;
  user?: User;
  userWallet?: UserWallet;
}

export const UserContext = createContext<UserContextState>({
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

  return (
    <UserContext.Provider
      value={{
        setUser,
        setUserWallet,
        user,
        userWallet,
      }}
    >
      <SWRConfig>{children}</SWRConfig>
    </UserContext.Provider>
  );
}
