# fractal-sdk

### Installation

```sh
npm install @fractalwagmi/fractal-sdk
```

### Example

[SDK Demo Preview](https://sdk-demo.fractalpreview.com/)

### Usage

#### 1. Import the global stylesheet

If you're using the default button that we provide, you'll need to import our
global stylesheet for the component to look correct.

```
import '@fractalwagmi/fractal-sdk/styles.css';
```

#### 2. Set up the provider

The provider will allow any child component to use hooks to access data.

```tsx
import { FractalProvider } from '@fractalwagmi/fractal-sdk';

const App = () => {
  return <FractalProvider>...</FractalProvider>;
};
```

#### 3. Render the `SignIn` component.

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

##### 4. Customization

You can customize the look of the button with either of these options:

```tsx
// Using your own class name to override any default styles:
<SignIn className="foobar">
```

```tsx
// Use your own child component:
<SignIn component={<YourOwnButton />}>
```

#### Using hooks to access data

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
