# Changelog

All notable changes to this project will be documented in this file.

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
