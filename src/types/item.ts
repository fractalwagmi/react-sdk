import { FractalSdkCommonChain } from '@fractalwagmi/fractal-sdk-public-api';

export interface Item {
  chain: FractalSdkCommonChain;
  files: ItemFile[];
  id: string;
  isForSale: boolean;
  name: string;
}

export interface ItemFile {
  type: string;
  uri: string;
}

export interface ForSaleItem {
  id: string;
  imageUrl: string;
  listTime?: MarketplaceTime;
  name: string;
  price?: MarketplacePrice;
}

export interface MarketplacePrice {
  amount: string;
  unit: string;
}

export interface MarketplaceTime {
  epochMillis: string;
  time: string;
}
