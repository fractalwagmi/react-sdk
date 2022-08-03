import { createContext, ReactNode, useState } from 'react';
import { FractalUser } from 'types/user';

interface UserContextState {
  fractalUser?: FractalUser;
  setFractalUser: (user: FractalUser | undefined) => void;
}

export const UserContext = createContext<UserContextState>({
  fractalUser: undefined,
  setFractalUser: () => undefined,
});

export interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [fractalUser, setFractalUser] = useState<FractalUser | undefined>(
    undefined,
  );

  return (
    <UserContext.Provider value={{ fractalUser, setFractalUser }}>
      {children}
    </UserContext.Provider>
  );
}
