import { ConnectionProvider } from '@solana/wallet-adapter-react';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface FractalUser {
  publicKey: string;
  userId: string;
  username: string;
}

export interface WalletProps {
  onLogin?: (user: FractalUser) => void;
  onLogout?: () => void;
  ready?: () => void;
}

enum Events {
  READY = 'READY',
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}

const FRAME_SRC = 'https://www.fractal.is/iframe';
const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 40;

const MS_IN_SEC = 1000;
const SEC_IN_MINUTE = 60;
const CONNECTION_INITIAL_TRANSACTION_TIMEOUT_MS = 2 * SEC_IN_MINUTE * MS_IN_SEC;

const ENDPOINT = 'https://api.mainnet-beta.solana.com';

interface UserContextState {
  setUser: (user: FractalUser | undefined) => void;
  user?: FractalUser;
}

export const UserContext = createContext<UserContextState>({
  setUser: () => undefined,
  user: undefined,
});

export interface WalletContextProviderProps {
  children: ReactNode;
  endpoint?: string;
}

export function WalletContextProvider({
  children,
  endpoint,
}: WalletContextProviderProps) {
  const [user, setUser] = useState<FractalUser | undefined>(undefined);

  return (
    <ConnectionProvider
      config={{
        confirmTransactionInitialTimeout:
          CONNECTION_INITIAL_TRANSACTION_TIMEOUT_MS,
      }}
      endpoint={endpoint ?? ENDPOINT}
    >
      <UserContext.Provider value={{ setUser, user }}>
        {children}
      </UserContext.Provider>
    </ConnectionProvider>
  );
}

export function Wallet({ onLogin, onLogout, ready }: WalletProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    window.addEventListener('message', event => {
      if (ref.current?.src.indexOf(event.origin) !== 0) {
        return;
      }

      if (event.data.event === Events.READY && ready) {
        ready();
      }
      if (event.data.event === Events.LOGGED_IN && onLogin) {
        const incomingUser: FractalUser = {
          publicKey: event.data.publicKey,
          userId: event.data.userId,
          username: event.data.username,
        };
        setUser(incomingUser);
        onLogin(incomingUser);
      }
      if (event.data.event === Events.LOGGED_OUT && onLogout) {
        setUser(undefined);
        onLogout();
      }
    });

    return () => {
      window.removeEventListener('message', () => {
        console.info('Fractal Wallet disconnected.');
      });
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={FRAME_SRC}
      frameBorder={0}
      width={FRAME_WIDTH}
      height={FRAME_HEIGHT}
    />
  );
}
