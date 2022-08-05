import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/fractal-sdk-api';
import { FractalCoin } from 'types';

export const processCoins = (
  sdkApiWalletCoins: FractalSdkWalletGetCoinsResponseCoin[],
): FractalCoin[] => {
  return sdkApiWalletCoins;
};
