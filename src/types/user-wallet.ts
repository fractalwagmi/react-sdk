export interface FractalUserWallet {
  /**
   * The list of solana public keys belonging to this user wallet. Currently, we
   * only support one solana address per fractal wallet, but this may change in
   * the future (hence a list).
   */
  solanaPublicKeys: string[];
}
