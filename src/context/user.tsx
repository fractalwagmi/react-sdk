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

  const setFractalUserInternal = (user?: FractalUser) => {
    setFractalUser(user);
  };

  return (
    <UserContext.Provider
      value={{ fractalUser, setFractalUser: setFractalUserInternal }}
    >
      {children}
    </UserContext.Provider>
  );
}
