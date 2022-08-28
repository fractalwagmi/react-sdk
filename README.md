# fractal-sdk

## Installation

```sh
npm install @fractalwagmi/fractal-sdk
```

## Example

[SDK Demo Preview](https://sdk-demo.fractalpreview.com/)

## Usage

### 1. Import the global stylesheet

If using the provided default button rather than your own UI, import our global
stylesheet to ensure that the component renders correctly:

```
import '@fractalwagmi/fractal-sdk/styles.css';
```

### 2. Set up the provider

Render the provider above any components that need access to data from the SDK.

```tsx
import { FractalProvider } from '@fractalwagmi/fractal-sdk';

const App = () => {
  return <FractalProvider clientId="YOUR_CLIENT_ID">...</FractalProvider>;
};
```

### 3. Render the `SignInWithFractal` component

This will display a button for logging in.

```tsx
import {
  Scope,
  SignInWithFractal,
  User,
  FractalSDKError,
} from '@fractalwagmi/fractal-sdk';

export function YourSignInComponent() {
  return (
    <SignInWithFractal
      // `scopes` defaults to [Scope.IDENTIFY].
      scopes={[Scope.IDENTIFY, Scope.ITEMS_READ, Scope.COINS_READ]}
      onError={(err: FractalSDKError) => {
        console.log(err.getUserFacingErrorMessage());
      }}
      onSuccess={(user: User) => {
        console.log('user = ', user);
      }}
    />
  );
}
```

#### Customizations

By default, there are 2 button variants that we support:

```tsx
// There is a "light" (default) and "dark" variant:
<SignInWithFractal variant="dark">
```

You can customize the look of the button with either of these options:

```tsx
// Using your own class name to override any default styles:
<SignInWithFractal className="foobar">
```

```tsx
// Use your own child component:
<SignInWithFractal component={<YourOwnButton />}>
```

#### SignInWithFractal Props

| Prop               | Type / Description                                                                                                                   | Default            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `buttonProps`      | `HTMLAttributes<HTMLButtonElement>`<br/>Any additional props for `<button>` that should be passed to the default sign-in button.     | `{}`               |
| `component`        | `React.ReactElement`<br/>Optional component to render instead of the default sign-in button                                          | `undefined`        |
| `signOutComponent` | `React.ReactElement`<br/>Optional component to render instead of the default sign-out button                                         |
| `undefined`        |
| `hideWhenSignedIn` | `boolean`<br/>Whether to hide the sign out button when signed in or not.                                                             | `false`            |
| `onError`          | `(e: FractalSDKError) => void`<br/>A callback function to call when an error occurs.                                                 | `undefined`        |
| `onSuccess`        | `(user: User) => void`<br/>A callback function to call when a user successfully signs in.                                            | `undefined`        |
| `onSignOut`        | `() => void`<br/>A callback function to call when a sign out occurs.                                                                 |
| `undefined`        |
| `scopes`           | `Scope[]`<br/>The scope to assign to the access token. See [src/types/scope.ts](/src/types/scope.ts) for a list of available scopes. | `[Scope.IDENTIFY]` |
| `variant`          | `"light" \| "dark"`<br/>The button style variant to use.                                                                             | `"light"`          |

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

### 5. Other misc. Non-data related hooks:

#### Logging out

```tsx
import { useSignOut } from '@fractalwagmi/fractal-sdk';

export function YourWalletComponent() {
  const { signOut } = useSignOut();

  return <button onClick={signOut}>Your Sign Out Button Text</button>;
}
```
