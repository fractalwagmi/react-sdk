import { FractalSDKError } from 'core/error';

export { SignIn as SignInWithFractal } from 'components/sign-in';
export { FractalSDKContextProvider as FractalProvider } from 'context/fractal-sdk-context';
export type { SignInProps } from 'components/sign-in';

export { FractalSDKError } from 'core/error';
export { Scope } from 'types';
export type { User, UserWallet, Coin, Item } from 'types';

// TODO: Remove FractalError in next major version, maintaining for backwards
// compatibility.
/**
 * @deprecated Use `FractalSDKError`. The `FractalError` alias will be removed
 *   in the next version.
 */
export const FractalError = FractalSDKError;
export * from 'hooks/public';
