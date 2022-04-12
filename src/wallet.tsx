import { useEffect, useRef, useState } from 'react';

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

export function Wallet({ onLogin, onLogout, ready }: WalletProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [_, setUser] = useState<FractalUser>();

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
    <iframe
      ref={ref}
      src={FRAME_SRC}
      frameBorder={0}
      width={FRAME_WIDTH}
      height={FRAME_HEIGHT}
    />
  );
}
