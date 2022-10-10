import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKTransactionStatusFetchUnknownError } from 'core/error';
import { useTransactionStatus } from 'hooks/public/use-transaction-status';
import { useGetTransactionStatusPollerQuery } from 'queries/transaction';
import { TransactionStatus } from 'types';

jest.mock('queries/transaction');

const TEST_SIGNATURE = 'test-signature';

let mockUseGetTransactionStatusPollerQuery: jest.Mock;

beforeEach(() => {
  mockUseGetTransactionStatusPollerQuery =
    useGetTransactionStatusPollerQuery as jest.Mock;
  mockUseGetTransactionStatusPollerQuery.mockReturnValue({
    data: undefined,
  });
});

describe('useTransactionStatus', () => {
  it('relays the correct signature', () => {
    renderHook(() => useTransactionStatus(TEST_SIGNATURE));
    expect(mockUseGetTransactionStatusPollerQuery).toHaveBeenCalledWith(
      TEST_SIGNATURE,
    );
  });

  it('returns a PENDING state if no confirmation is provided', () => {
    mockUseGetTransactionStatusPollerQuery.mockReturnValue({
      data: {
        confirmed: undefined,
      },
    });
    const { result } = renderHook(() => useTransactionStatus(TEST_SIGNATURE));
    expect(result.current.data).toBe(TransactionStatus.PENDING);
  });

  it('returns a SUCCESS state when underlying API call returns a success', () => {
    mockUseGetTransactionStatusPollerQuery.mockReturnValue({
      data: {
        confirmed: {
          success: true,
        },
      },
    });

    const { result } = renderHook(() => useTransactionStatus(TEST_SIGNATURE));
    expect(result.current.data).toBe(TransactionStatus.SUCCESS);
  });

  it('returns a FAIL state when underlying API call returns a failure', () => {
    mockUseGetTransactionStatusPollerQuery.mockReturnValue({
      data: {
        confirmed: {
          success: false,
        },
      },
    });

    const { result } = renderHook(() => useTransactionStatus(TEST_SIGNATURE));
    expect(result.current.data).toBe(TransactionStatus.FAIL);
  });

  it('returns a FractalSDKTransactionStatusFetchUnknownError in the event of an unknown error', () => {
    mockUseGetTransactionStatusPollerQuery.mockReturnValue({
      data: undefined,
      error: new Error('some unknown error'),
    });
    const { result } = renderHook(() => useTransactionStatus(TEST_SIGNATURE));

    expect(result.current.error).toEqual(
      expect.any(FractalSDKTransactionStatusFetchUnknownError),
    );
  });
});
