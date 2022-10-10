import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { useListItem } from 'hooks/public/use-list-item';
import * as useSignTransactionModule from 'hooks/public/use-sign-transaction';
import * as itemQueriesModule from 'queries/items';

const TEST_TOKEN_ADDRESS = 'test-token-address';
const TEST_TRANSACTION = 'test-transaction';
const TEST_TRANSACTION_SIGNATURE = 'test-transaction-signature';

describe('useListItem', () => {
  let wrapper: React.FC;
  let spyUseGenerateListTransactionMutation: jest.SpyInstance;
  let spyUseSignTransaction: jest.SpyInstance;
  let mockMutateForListTransaction: jest.Mock;
  let mockSignTransaction: jest.Mock;

  beforeEach(() => {
    mockMutateForListTransaction = jest.fn();
    mockMutateForListTransaction.mockResolvedValue({
      transaction: TEST_TRANSACTION,
    });

    mockSignTransaction = jest.fn();
    mockSignTransaction.mockResolvedValue({
      signature: TEST_TRANSACTION_SIGNATURE,
    });

    spyUseGenerateListTransactionMutation = jest.spyOn(
      itemQueriesModule,
      'useGenerateListTransactionMutation',
    );
    spyUseGenerateListTransactionMutation.mockReturnValue({
      mutateAsync: mockMutateForListTransaction,
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
    const { result } = renderHook(() => useListItem(), {
      wrapper,
    });

    result.current.listItem({
      price: '0.02',
      tokenAddress: TEST_TOKEN_ADDRESS,
    });

    expect(mockMutateForListTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForListTransaction).toHaveBeenCalledWith({
      price: '0.02',
      quantity: 1,
      tokenId: TEST_TOKEN_ADDRESS,
    });
  });

  it('returns a function that relays the correct quantity', () => {
    const { result } = renderHook(() => useListItem(), {
      wrapper,
    });

    result.current.listItem({
      price: '0.02',
      quantity: 5,
      tokenAddress: TEST_TOKEN_ADDRESS,
    });

    expect(mockMutateForListTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForListTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 5,
      }),
    );
  });

  it('returns a function that relays the correct price', () => {
    const { result } = renderHook(() => useListItem(), {
      wrapper,
    });

    result.current.listItem({
      price: '0.53',
      quantity: 5,
      tokenAddress: TEST_TOKEN_ADDRESS,
    });

    expect(mockMutateForListTransaction).toHaveBeenCalledTimes(1);
    expect(mockMutateForListTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        price: '0.53',
      }),
    );
  });

  it('returns a function that attempts to sign the transaction', async () => {
    const SOME_TRANSACTION = 'some-transaction';
    mockMutateForListTransaction.mockResolvedValue({
      transaction: SOME_TRANSACTION,
    });

    const { result } = renderHook(() => useListItem(), {
      wrapper,
    });

    await result.current.listItem({
      price: '0.02',
      quantity: 5,
      tokenAddress: TEST_TOKEN_ADDRESS,
    });

    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).toHaveBeenCalledWith(SOME_TRANSACTION);
  });

  it('returns a function that resolves to the transaction signature', async () => {
    const SOME_SIGNATURE = 'some-signature';
    mockSignTransaction.mockResolvedValue({ signature: SOME_SIGNATURE });
    const { result } = renderHook(() => useListItem(), {
      wrapper,
    });

    const actual = await result.current.listItem({
      price: '0.02',
      quantity: 5,
      tokenAddress: TEST_TOKEN_ADDRESS,
    });

    expect(actual.signature).toEqual(SOME_SIGNATURE);
  });
});
