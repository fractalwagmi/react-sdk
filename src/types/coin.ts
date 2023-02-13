import { FractalSdkCommonChain } from '@fractalwagmi/fractal-sdk-public-api';

export interface Coin {
  address: string;
  chain: FractalSdkCommonChain;
  decimals: number;
  logoUri: string;
  name: string;
  symbol: string;
  uiAmount: string;
}
