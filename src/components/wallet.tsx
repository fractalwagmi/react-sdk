import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { createContext, useEffect, useRef, useState } from 'react';

export interface FractalUser {
  publicKey: string;
  userId: string;
  username: string;
}

export interface WalletProps {
  onLogin: (user: FractalUser) => void;
  onLogout: () => void;
  ready: () => void;
}

enum Events {
  READY = 'READY',
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}

const FRAME_SRC = 'https://fractal.is/iframe';
const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 40;

const MS_IN_SEC = 1000;
const SEC_IN_MINUTE = 60;
const CONNECTION_INITIAL_TRANSACTION_TIMEOUT_MS = 2 * SEC_IN_MINUTE * MS_IN_SEC;

const ENDPOINT = 'https://api.mainnet-beta.solana.com';

export const UserContext = createContext<FractalUser | undefined>(undefined);

export function Wallet({ onLogin, onLogout, ready }: WalletProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [user, setUser] = useState<FractalUser | undefined>(undefined);

  useEffect(() => {
    window.addEventListener('message', event => {
      if (ref.current?.src.indexOf(event.origin) !== 0) {
        return;
      }

      if (event.data.event === Events.READY) {
        ready();
      }
      if (event.data.event === Events.LOGGED_IN) {
        const incomingUser: FractalUser = {
          publicKey: event.data.publicKey,
          userId: event.data.userId,
          username: event.data.username,
        };
        setUser(incomingUser);
        onLogin(incomingUser);
      }
      if (event.data.event === Events.LOGGED_OUT) {
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
    <ConnectionProvider
      config={{
        confirmTransactionInitialTimeout:
          CONNECTION_INITIAL_TRANSACTION_TIMEOUT_MS,
      }}
      endpoint={ENDPOINT}
    >
      <UserContext.Provider value={user}>
        <iframe
          ref={ref}
          src={FRAME_SRC}
          frameBorder={0}
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT}
        />
      </UserContext.Provider>
    </ConnectionProvider>
  );
}
