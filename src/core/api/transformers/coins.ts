import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/ts-api';
import { Coin } from 'types';

export const transformCoins = (
  sdkApiWalletCoins: FractalSdkWalletGetCoinsResponseCoin[],
): Coin[] => {
  return sdkApiWalletCoins;
};
