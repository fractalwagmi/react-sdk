import { FractalSDKError, FractalSDKListItemUnknownError } from 'core/error';
import { useSignTransaction } from 'hooks/public/use-sign-transaction';
import { useGenerateListTransactionMutation } from 'queries/items';
import { useCallback } from 'react';

export interface ListItemParameters {
  /** The price of the item. Example: "0.02" for 0.02 sol. */
  price: string;

  /**
   * The quantity of `tokenAddress`s to purchase.
   *
   * Defaults to 1. (This should be 1 for all NFTs).
   */
  quantity?: number;

  /** The token address of the item being purchased. */
  tokenAddress: string;
}

export const useListItem = () => {
  const { mutateAsync: generateListTransaction } =
    useGenerateListTransactionMutation();
  const { signTransaction } = useSignTransaction();

  const listItem = useCallback(
    async ({
      price,
      quantity = 1,
      tokenAddress,
    }: ListItemParameters): Promise<{ signature: string }> => {
      try {
        const { transaction } = await generateListTransaction({
          price,
          quantity,
          tokenId: tokenAddress,
        });
        const { signature } = await signTransaction(transaction);
        return { signature };
      } catch (err: unknown) {
        if (err instanceof FractalSDKError) {
          throw err;
        }
        throw new FractalSDKListItemUnknownError(
          `An unknown error occured while attempting to buy ${tokenAddress}. ` +
            `err = ${err}`,
        );
      }
    },
    [],
  );

  return { listItem };
};
