import { renderHook } from '@testing-library/react-hooks/dom';
import {
  FractalSDKTransactionStatusFetchInvalidError,
  FractalSDKTransactionStatusFetchUnknownError,
} from 'core/error';
import { useWaitForTransactionStatus } from 'hooks/public/use-wait-for-transaction-status';
import { useTransactionStatusPoller } from 'queries/transaction';
import { TransactionStatus } from 'types';

jest.mock('queries/transaction');

const TEST_SIGNATURE = 'test-signature';

let mockPollForTransactionStatus: jest.Mock;

beforeEach(() => {
  mockPollForTransactionStatus = jest.fn();
  (useTransactionStatusPoller as jest.Mock).mockReturnValue(
    mockPollForTransactionStatus,
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useWaitForTransactionStatus', () => {
  it('should return a success if the poller returns a success', async () => {
    mockPollForTransactionStatus.mockResolvedValue(true);
    const { result } = renderHook(() => useWaitForTransactionStatus());

    const status = await result.current.waitForTransactionStatus(
      TEST_SIGNATURE,
    );

    expect(status).toBe(TransactionStatus.SUCCESS);
  });

  it('should return a failure if the poller returns a failure', async () => {
    mockPollForTransactionStatus.mockResolvedValue(false);
    const { result } = renderHook(() => useWaitForTransactionStatus());

    const status = await result.current.waitForTransactionStatus(
      TEST_SIGNATURE,
    );

    expect(status).toBe(TransactionStatus.FAIL);
  });

  it(
    'rethrows the same error if the error is an instance of ' +
      'FractalSDKError',
    async () => {
      mockPollForTransactionStatus.mockRejectedValue(
        new FractalSDKTransactionStatusFetchInvalidError('Some unknown error'),
      );
      const { result } = renderHook(() => useWaitForTransactionStatus());

      let error: unknown;
      try {
        await result.current.waitForTransactionStatus(TEST_SIGNATURE);
      } catch (err: unknown) {
        error = err;
      }

      expect(error).toBeInstanceOf(
        FractalSDKTransactionStatusFetchInvalidError,
      );
    },
  );

  it(
    'falls back to throwing an instance of ' +
      'FractalSDKTransactionStatusFetchUnknownError if an unknown error is ' +
      'encountered',
    async () => {
      mockPollForTransactionStatus.mockRejectedValue(
        new Error('Some unknown error'),
      );
      const { result } = renderHook(() => useWaitForTransactionStatus());

      let error: unknown;
      try {
        await result.current.waitForTransactionStatus(TEST_SIGNATURE);
      } catch (err: unknown) {
        error = err;
      }

      expect(error).toBeInstanceOf(
        FractalSDKTransactionStatusFetchUnknownError,
      );
    },
  );
});
