/** The list of available scopes for the Fractal SDK. */
export enum Scope {
  /** Necessary for reading items in a wallet. */
  ITEMS_READ = 'items:read',

  /** Necessary for reading coins available in a wallet. */
  COINS_READ = 'coins:read',

  /** Necessary for identifying the user. */
  IDENTIFY = 'identify',
}
