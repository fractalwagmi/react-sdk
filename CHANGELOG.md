# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## [1.1.0] - 2022-10-11

#### Added

- Adds 4 new hooks to help react-based web games create a marketplace through
  our SDK:
  - `useBuyItem` for buying an item from the marketplace
  - `useListItem` for listing an item on the marketplace
  - `useCancelListItem` for cancelling an item that is currently listed on the marketplace
  - `useItemsForSale` for fetching the list of items that are on sale on the
    marketplace (for the project that the auth token is scoped to).

#### Changed

- Internal implementation for browser-side data caching was swapped out.

#### Removed

n/a
