# fractal-sdk

### Installation

```sh
npm install @fractalwagmi/fractal-sdk
```

### Example
[SDK Demo Preview](https://sdk-demo.fractalpreview.com/)

### Usage

1. Setup the provider above any components that need access to the wallet.

_Note: endpoint defaults to `https://api.mainnet-beta.solana.com`_

```tsx
import { WalletProvider } from '@fractalwagmi/fractal-sdk';

<WalletProvider endpoint={'https://optional-rpc-provider.com'}>
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
