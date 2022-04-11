import { useEffect, useRef, useState } from 'react';

export interface FractalUser {
  publicKey: string;
  userId: string;
  username: string;
}

export interface WalletProps {
  loggedIn: (user: FractalUser) => void;
  loggedOut: () => void;
  ready: () => void;
}

enum Events {
  READY = 'ready',
  LOGGED_IN = 'loggedIn',
  LOGGED_OUT = 'loggedOut',
}

export function Wallet({ loggedIn, loggedOut, ready }: WalletProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [_, setUser] = useState<FractalUser>();

  useEffect(() => {
    window.addEventListener('message', event => {
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
        loggedIn(incomingUser);
      }
      if (event.data.event === Events.LOGGED_OUT) {
        setUser(undefined);
        loggedOut();
      }
    });
  }, []);

  return (
    <iframe
      ref={ref}
      src="https://fractal.is/iframe"
      frameBorder={0}
      width={280}
      height={40}
    />
  );
}
