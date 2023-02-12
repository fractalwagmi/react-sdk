import { FractalSdkWalletGetItemsResponseItem } from '@fractalwagmi/fractal-sdk-public-api';
import { FractalWebsdkMarketplaceGetForSaleItemsResponseItem } from '@fractalwagmi/fractal-sdk-websdk-api';
import { Item, ForSaleItem } from 'types';

export const transformItems = (
  sdkApiWalletItems: FractalSdkWalletGetItemsResponseItem[],
): Item[] => {
  // We currently don't need to do any processing to turn
  // `FractalSdkWalletGetItemsResponseItem[]` into `Item[]` as the two types are
  // identical.
  //
  // However, we have this processor in place to act as a translation layer if
  // the SDK API ever makes changes to its data model or introduces any
  // breaking changes.
  return sdkApiWalletItems;
};

export const trasnformForSaleItems = (
  sdkApiForSaleItems: FractalWebsdkMarketplaceGetForSaleItemsResponseItem[],
): ForSaleItem[] => {
  return sdkApiForSaleItems;
};
