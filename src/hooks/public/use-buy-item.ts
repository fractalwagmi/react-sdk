import {
  FractalSDKError,
  FractalSDKSignTransactionUnknownError,
} from 'core/error';
import { useSignTransaction } from 'hooks/public/use-sign-transaction';
import { useGenerateBuyTransactionMutation } from 'queries/items';
import { useCallback } from 'react';

export interface BuyItemParameters {
  /**
   * The quantity of `tokenId`s to purchase.
   *
   * Defaults to 1. (This should be 1 for all NFTs).
   */
  quantity?: number;

  /** The token address of the item being purchased. */
  tokenId: string;
}

export const useBuyItem = () => {
  const { mutateAsync: generateBuyTransaction } =
    useGenerateBuyTransactionMutation();
  const { signTransaction } = useSignTransaction();

  const buyItem = useCallback(
    async ({
      quantity = 1,
      tokenId,
    }: BuyItemParameters): Promise<{ signature: string }> => {
      try {
        const { transaction } = await generateBuyTransaction({
          quantity,
          tokenId,
        });
        const { signature } = await signTransaction(transaction);
        return { signature };
      } catch (err: unknown) {
        if (err instanceof FractalSDKError) {
          throw err;
        }
        // TODO: Enumerate all possible errors for any grpc errors that come
        // from `generateBuyTransaction`.
        throw new FractalSDKSignTransactionUnknownError(
          `An unknown error occured while attempting to buy ${tokenId}. ` +
            `err = ${err}`,
        );
      }
    },
    [],
  );

  return { buyItem };
};
