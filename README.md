# fractal-sdk

### Installation

```sh
npm install @fractalwagmi/fractal-sdk
```

### Usage

1. Setup the provider one level above whatever level you will need data from the wallet.
```tsx
import { WalletProvider } from '@fractalwagmi/fractal-sdk';

<WalletProvider>
  ...
</WalletProvider>
```

2. Use the wallet and related hooks.
```tsx
import { FractalWallet, useFractalUser, useSolBalance } from '@fractalwagmi/fractal-sdk';

export function YourWalletComponent() {
  // Hook returns userId, publicKey, and username
  const user = useFractalUser();
  // Returns sol in lamports
  const sol = useSolBalance();
  console.log(user);
  console.log(sol);

  return (
    <>
      <FractalWallet
        onLogin={user => {
          console.log(user);
        }}
        onLogout={() => {
          console.log('logged out');
        }}
        ready={() => {
          console.log('ready');
        }}
      />
      <div>{user?.userId}</div>
      <div>{user?.publicKey}</div>
      <div>{user?.username}</div>
      <div>{sol?.balance}</div>
    </>
  );
}

```