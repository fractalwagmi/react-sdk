import { createContext, ReactNode, useState } from 'react';
import { FractalUser } from 'types/user';

interface UserContextState {
  setUser: (user: FractalUser | undefined) => void;
  user?: FractalUser;
}

export const UserContext = createContext<UserContextState>({
  setUser: () => undefined,
  user: undefined,
});

export interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<FractalUser | undefined>(undefined);

  return (
    <UserContext.Provider value={{ setUser, user }}>
      {children}
    </UserContext.Provider>
  );
}
