import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/fractal-sdk-public-api';
import { Coin } from 'types';

export const transformCoins = (
  sdkApiWalletCoins: FractalSdkWalletGetCoinsResponseCoin[],
): Coin[] => {
  return sdkApiWalletCoins;
};
