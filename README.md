# fractal-sdk

## Installation

```sh
npm install @fractalwagmi/fractal-sdk
```

## Example

[SDK Demo Preview](https://sdk-demo.fractalpreview.com/)

## Usage

### 1. Import the global stylesheet

If using the provided default button, import our global stylesheet to ensure
that the component renders correctly:

```
import '@fractalwagmi/fractal-sdk/styles.css';
```

### 2. Set up the provider

Render the provider any components that need access to data from the SDK.

```tsx
import { FractalProvider } from '@fractalwagmi/fractal-sdk';

const App = () => {
  return <FractalProvider>...</FractalProvider>;
};
```

### 3. Render the `SignIn` component

This will display a button for logging in.

```tsx
import { Scope, SignIn, User } from '@fractalwagmi/fractal-sdk';

export function YourSignInComponent() {
  return (
    <SignIn
      // The `clientId` is the only required prop.
      clientId="YOUR_CLIENT_ID"
      // `scopes` defaults to [Scope.IDENTIFY].
      scopes={[Scope.IDENTIFY, Scope.ITEMS_READ, Scope.COINS_READ]}
      onError={err => {
        console.log('err = ', err);
      }}
      onSuccess={(user: User) => {
        console.log('user = ', user);
      }}
    />
  );
}
```

#### Customizations

You can customize the look of the button with either of these options:

```tsx
// Using your own class name to override any default styles:
<SignIn className="foobar">
```

```tsx
// Use your own child component:
<SignIn component={<YourOwnButton />}>
```

### 4. Use the hooks to access data

```tsx
import {
  useCoins,
  useItems,
  useUser,
  useUserWallet,
} from '@fractalwagmi/fractal-sdk';

export function YourWalletComponent() {
  // Returns user information like email, username, and id.
  const { data: user } = useUser();

  // Returns the user's wallet information like solana public keys.
  const { data: userWallet } = useUserWallet();

  // Returns the items in the user's wallet.
  const { data: items } = useItems();

  // Returns the coins in the user's wallet.
  const { data: coins } = useCoins();

  return <div>...</div>;
}
```
