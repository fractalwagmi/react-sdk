import {
  FractalSDKCancelListItemUnknownError,
  FractalSDKError,
} from 'core/error';
import { useSignTransaction } from 'hooks/public/use-sign-transaction';
import { useGenerateCancelListTransactionMutation } from 'queries/items';
import { useCallback } from 'react';

export interface CancelListItemParameters {
  /**
   * The quantity of `tokenId`s to cancel.
   *
   * Defaults to 1. (This should be 1 for all NFTs).
   */
  quantity?: number;

  /** The token address of the item being cancelled. */
  tokenId: string;
}

export const useCancelListItem = () => {
  const { mutateAsync: generateCancelListTransaction } =
    useGenerateCancelListTransactionMutation();
  const { signTransaction } = useSignTransaction();

  const cancelListItem = useCallback(
    async ({
      quantity = 1,
      tokenId,
    }: CancelListItemParameters): Promise<{ signature: string }> => {
      try {
        const { transaction } = await generateCancelListTransaction({
          quantity,
          tokenId,
        });
        const { signature } = await signTransaction(transaction);
        return { signature };
      } catch (err: unknown) {
        if (err instanceof FractalSDKError) {
          throw err;
        }
        throw new FractalSDKCancelListItemUnknownError(
          `An unknown error occured while attempting to buy ${tokenId}. ` +
            `err = ${err}`,
        );
      }
    },
    [],
  );

  return { cancelListItem };
};
