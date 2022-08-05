import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/fractal-sdk-api';
import { Coin } from 'types';

export const processCoins = (
  sdkApiWalletCoins: FractalSdkWalletGetCoinsResponseCoin[],
): Coin[] => {
  return sdkApiWalletCoins;
};
