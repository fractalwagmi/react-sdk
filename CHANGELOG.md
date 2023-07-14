# Changelog

All notable changes to this project will be documented in this file.

## [1.3.3] - 2023-06-12

- Removes React@17 as a peer dependency. The build for React 17 host apps was
  failing due to the missing jsx-runtime export from React, which has been fixed
  in React 18.
- Renames `useSignTransaction` to `useSignAndSendTransaction`. This marks
  `useSignTransaction` as deprecated with a `console.info` to inform the
  developer of the upcoming breaking change in the next major version.
- Fixes a bug in safari where the sign in / sign transaction popups were being
  blocked by default.

## [1.3.2] - 2023-06-12

- Fixes `useSignMessage` to use bs58 encoding for transmission to the Fractal.is
  popup. This is an implementation detail, but fixes a bug where
  `useSignMessage` only worked for utf-8 encoded strings and not serialized
  `Message` objects.

## [1.3.1] - 2023-05-19

- Adds a `useSignMessage` hook for signing arbitrary messages. This differs from
  `useSignTransaction` since it takes in a raw message `Uint8Array` instead of
  a serialized `Transaction` object and is mostly useful for callers that
  want to use the react-sdk to sign messages without sending anything to the
  network such that the caller can add subsequent signatures before sending it
  to the network.

## [1.2.3] - 2023-03-08

- Uses custom `context` for all react query calls. This will allow consumers to
  use react query without having to worry about conflicting contexts used by
  the underlying `QueryClientProvider` within the SDK as well as the one that a
  consumer sets up in their app.

## [1.2.1] - 2023-02-13

- Adds a `chain` field on exported `Item` and `Coin` type.

## [1.1.7] - 2023-01-28

- Adds hook for fiat onramp.

## [1.1.1] - 2022-10-14

- Adds a [bugfix](https://github.com/fractalwagmi/react-sdk/issues/100) for for-sale items not being removed from the client-side data cache when a user logs out.

## [1.1.0] - 2022-10-11

#### Added

- Adds 4 new hooks to help react-based web games create a marketplace through
  our SDK:
  - `useBuyItem` for buying an item from the marketplace
  - `useListItem` for listing an item on the marketplace
  - `useCancelListItem` for cancelling an item that is currently listed on the marketplace
  - `useItemsForSale` for fetching the list of items that are on sale on the
    marketplace (for the project that the auth token is scoped to).
- Adds 2 new hooks to detect when a transaction is posted:
  - `useTransactionStatus` - given a transaction signature, this returns an
    updating status object.
  - `useWaitForTransactionStatus` - given a transaction signature, this hook
    returns an async function that returns promise whenever the transaction
    posts to the chain.

#### Changed

- Internal implementation for browser-side data caching was swapped out.

#### Removed

n/a
