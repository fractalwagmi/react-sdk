import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { useCancelListItem } from 'hooks/public/use-cancel-list-item';
import * as useSignTransactionModule from 'hooks/public/use-sign-transaction';
import * as itemQueriesModule from 'queries/items';

const TEST_TOKEN_ID = 'test-token-id';
const TEST_TRANSACTION = 'test-transaction';
const TEST_TRANSACTION_SIGNATURE = 'test-transaction-signature';

describe('useCancelListItem', () => {
  let wrapper: React.FC;
  let spyUseGenerateCancelListTransactionMutation: jest.SpyInstance;
  let spyUseSignTransaction: jest.SpyInstance;
  let mockMutateForCancelListTransaction: jest.Mock;
  let mockSignTransaction: jest.Mock;

  beforeEach(() => {
    mockMutateForCancelListTransaction = jest.fn();
    mockMutateForCancelListTransaction.mockResolvedValue({
      transaction: TEST_TRANSACTION,
    });

    mockSignTransaction = jest.fn();
    mockSignTransaction.mockResolvedValue({
      signature: TEST_TRANSACTION_SIGNATURE,
    });

    spyUseGenerateCancelListTransactionMutation = jest.spyOn(
      itemQueriesModule,
      'useGenerateCancelListTransactionMutation',
    );
    spyUseGenerateCancelListTransactionMutation.mockReturnValue({
      mutateAsync: mockMutateForCancelListTransaction,
    });

    spyUseSignTransaction = jest.spyOn(
      useSignTransactionModule,
      'useSignTransaction',
    );
    spyUseSignTransaction.mockReturnValue({
      signTransaction: mockSignTransaction,
    });

    wrapper = ({ children }) => (
      <FractalSDKContextProvider clientId="abc">
        {children}
      </FractalSDKContextProvider>
    );
  });

  it('returns a function that generates a transaction', () => {
    const { result } = renderHook(() => useCancelListItem(), {
      wrapper,
    });

    result.current.cancelListItem({ tokenId: TEST_TOKEN_ID });

    expect(mockMutateForCancelListTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForCancelListTransaction).toHaveBeenCalledWith({
      quantity: 1,
      tokenId: TEST_TOKEN_ID,
    });
  });

  it('returns a function that relays the correct quantity', () => {
    const { result } = renderHook(() => useCancelListItem(), {
      wrapper,
    });

    result.current.cancelListItem({ quantity: 5, tokenId: TEST_TOKEN_ID });

    expect(mockMutateForCancelListTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForCancelListTransaction).toHaveBeenCalledWith({
      quantity: 5,
      tokenId: TEST_TOKEN_ID,
    });
  });

  it('returns a function that attempts to sign the transaction', async () => {
    const SOME_TRANSACTION = 'some-transaction';
    mockMutateForCancelListTransaction.mockResolvedValue({
      transaction: SOME_TRANSACTION,
    });

    const { result } = renderHook(() => useCancelListItem(), {
      wrapper,
    });

    await result.current.cancelListItem({
      quantity: 5,
      tokenId: TEST_TOKEN_ID,
    });

    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).toHaveBeenCalledWith(SOME_TRANSACTION);
  });

  it('returns a function that resolves to the transaction signature', async () => {
    const SOME_SIGNATURE = 'some-signature';
    mockSignTransaction.mockResolvedValue({ signature: SOME_SIGNATURE });
    const { result } = renderHook(() => useCancelListItem(), {
      wrapper,
    });

    const actual = await result.current.cancelListItem({
      quantity: 5,
      tokenId: TEST_TOKEN_ID,
    });

    expect(actual.signature).toEqual(SOME_SIGNATURE);
  });
});
