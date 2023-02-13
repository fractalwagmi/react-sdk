import { FractalSDKBuyItemUnknownError, FractalSDKError } from 'core/error';
import { useSignTransaction } from 'hooks/public/use-sign-transaction';
import { useGenerateBuyTransactionMutation } from 'queries/items';
import { useCallback } from 'react';

export interface BuyItemParameters {
  /**
   * The quantity of `tokenAddress`s to purchase.
   *
   * Defaults to 1. (This should be 1 for all NFTs).
   */
  quantity?: number;

  /** The token address of the item being purchased. */
  tokenAddress: string;
}

export const useBuyItem = () => {
  const { mutateAsync: generateBuyTransaction } =
    useGenerateBuyTransactionMutation();
  const { signTransaction } = useSignTransaction();

  const buyItem = useCallback(
    async ({
      quantity = 1,
      tokenAddress,
    }: BuyItemParameters): Promise<{ signature: string }> => {
      try {
        const { transaction } = await generateBuyTransaction({
          quantity,
          tokenId: tokenAddress,
        });
        const { signature } = await signTransaction(transaction);
        return { signature };
      } catch (err: unknown) {
        if (err instanceof FractalSDKError) {
          throw err;
        }
        throw new FractalSDKBuyItemUnknownError(
          `An unknown error occured while attempting to buy ${tokenAddress}. ` +
            `err = ${err}`,
        );
      }
    },
    [generateBuyTransaction, signTransaction],
  );

  return { buyItem };
};
