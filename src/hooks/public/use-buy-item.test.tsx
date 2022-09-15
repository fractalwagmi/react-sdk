import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { useBuyItem } from 'hooks/public/use-buy-item';
import * as useSignTransactionModule from 'hooks/public/use-sign-transaction';
import * as itemQueriesModule from 'queries/items';

const TEST_TOKEN_ID = 'test-token-id';
const TEST_TRANSACTION = 'test-transaction';
const TEST_TRANSACTION_SIGNATURE = 'test-transaction-signature';

describe('useBuyItem', () => {
  let wrapper: React.FC;
  let spyUseGenerateBuyTransactionMutation: jest.SpyInstance;
  let spyUseSignTransaction: jest.SpyInstance;
  let mockMutateForBuyTransaction: jest.Mock;
  let mockSignTransaction: jest.Mock;

  beforeEach(() => {
    mockMutateForBuyTransaction = jest.fn();
    mockMutateForBuyTransaction.mockResolvedValue({
      transaction: TEST_TRANSACTION,
    });

    mockSignTransaction = jest.fn();
    mockSignTransaction.mockResolvedValue({
      signature: TEST_TRANSACTION_SIGNATURE,
    });

    spyUseGenerateBuyTransactionMutation = jest.spyOn(
      itemQueriesModule,
      'useGenerateBuyTransactionMutation',
    );
    spyUseGenerateBuyTransactionMutation.mockReturnValue({
      mutateAsync: mockMutateForBuyTransaction,
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
    const { result } = renderHook(() => useBuyItem(), {
      wrapper,
    });

    result.current.buyItem({ tokenId: TEST_TOKEN_ID });

    expect(mockMutateForBuyTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForBuyTransaction).toHaveBeenCalledWith({
      quantity: 1,
      tokenId: TEST_TOKEN_ID,
    });
  });

  it('returns a function that relays the correct quantity', () => {
    const { result } = renderHook(() => useBuyItem(), {
      wrapper,
    });

    result.current.buyItem({ quantity: 5, tokenId: TEST_TOKEN_ID });

    expect(mockMutateForBuyTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForBuyTransaction).toHaveBeenCalledWith({
      quantity: 5,
      tokenId: TEST_TOKEN_ID,
    });
  });

  it('returns a function that attempts to sign the transaction', async () => {
    const SOME_TRANSACTION = 'some-transaction';
    mockMutateForBuyTransaction.mockResolvedValue({
      transaction: SOME_TRANSACTION,
    });

    const { result } = renderHook(() => useBuyItem(), {
      wrapper,
    });

    await result.current.buyItem({ quantity: 5, tokenId: TEST_TOKEN_ID });

    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).toHaveBeenCalledWith(SOME_TRANSACTION);
  });

  it('returns a function that resolves to the transaction signature', async () => {
    const SOME_SIGNATURE = 'some-signature';
    mockSignTransaction.mockResolvedValue({ signature: SOME_SIGNATURE });
    const { result } = renderHook(() => useBuyItem(), {
      wrapper,
    });

    const actual = await result.current.buyItem({
      quantity: 5,
      tokenId: TEST_TOKEN_ID,
    });

    expect(actual.signature).toEqual(SOME_SIGNATURE);
  });
});
