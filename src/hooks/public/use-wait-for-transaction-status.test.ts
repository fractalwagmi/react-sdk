import { renderHook } from '@testing-library/react-hooks/dom';
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
});
