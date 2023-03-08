import { FractalWebsdkTransactionGetTransactionStatusResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import * as reactQuery from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { queryContext } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import {
  FractalSDKTransactionStatusFetchInvalidError,
  FractalSDKTransactionStatusFetchUnknownError,
} from 'core/error';
import { TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useUser } from 'hooks/public/use-user';
import { Status as GrpcStatusCode } from 'nice-grpc-common';
import {
  useGetTransactionStatusPollerQuery,
  useTransactionStatusPoller,
} from 'queries/transaction';

jest.mock('hooks/public/use-user');
jest.mock('core/api/client');
jest.mock('core/api/client');

type TransactionStatusResponse =
  FractalWebsdkTransactionGetTransactionStatusResponse;

const TWO_SECONDS_MS = 2000;
const TEST_SIGNATURE = 'test-signature';

let mockUseUser: jest.Mock;
let mockGetTransactionStatus: jest.Mock;
let spyUseQuery: jest.SpyInstance;

let queryClient: reactQuery.QueryClient;
let wrapper: React.FC;

beforeEach(() => {
  queryClient = new reactQuery.QueryClient();
  wrapper = ({ children }) => (
    <reactQuery.QueryClientProvider client={queryClient} context={queryContext}>
      {children}
    </reactQuery.QueryClientProvider>
  );

  mockUseUser = useUser as jest.Mock;
  mockUseUser.mockReturnValue({
    data: TEST_FRACTAL_USER,
  });

  mockGetTransactionStatus = webSdkApiClient.websdk
    .getTransactionStatus as jest.Mock;
  mockGetTransactionStatus.mockResolvedValue({
    data: {
      confirmed: undefined,
    } as TransactionStatusResponse,
  });

  spyUseQuery = jest.spyOn(reactQuery, 'useQuery');
});

afterEach(() => {
  mockUseUser.mockReset();
  mockGetTransactionStatus.mockReset();
  spyUseQuery.mockRestore();
  jest.resetAllMocks();
});

describe('useGetTransactionStatusPoller', () => {
  it('does not poll when there is no user', () => {
    mockUseUser.mockReturnValue({ data: undefined });

    renderHook(() => useGetTransactionStatusPollerQuery(TEST_SIGNATURE), {
      wrapper,
    });

    expect(spyUseQuery).toHaveBeenCalledTimes(1);
    expect(spyUseQuery).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it('removes the query cache when a user logs out', () => {
    const mockRemove = jest.fn();
    spyUseQuery.mockReturnValue({
      data: {
        confirmed: undefined,
      },
      error: undefined,
      remove: mockRemove,
    });
    const { rerender } = renderHook(
      () => useGetTransactionStatusPollerQuery(TEST_SIGNATURE),
      { wrapper },
    );
    expect(mockRemove).not.toHaveBeenCalled();

    mockUseUser.mockReturnValue({ data: undefined });
    act(() => {
      rerender();
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('polls for the transaction status', async () => {
    const { result, waitForValueToChange } = renderHook(
      () => useGetTransactionStatusPollerQuery(TEST_SIGNATURE),
      {
        wrapper,
      },
    );
    await waitForValueToChange(() => result.current.data);

    expect(spyUseQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        refetchInterval: TWO_SECONDS_MS,
      }),
    );
  });

  it('stops polling after transaction status is returned', async () => {
    const { result, waitForValueToChange } = renderHook(
      () => useGetTransactionStatusPollerQuery(TEST_SIGNATURE),
      { wrapper },
    );
    expect(spyUseQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        refetchInterval: TWO_SECONDS_MS,
      }),
    );
    await waitForValueToChange(() => result.current.data);

    mockGetTransactionStatus.mockResolvedValue({
      data: {
        confirmed: { success: true },
      },
    });
    result.current.refetch();
    await waitForValueToChange(() => result.current.data);

    expect(spyUseQuery).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        refetchInterval: false,
      }),
    );
  });

  it('does not fetch when window is refocused', async () => {
    const { result, waitForValueToChange } = renderHook(
      () => useGetTransactionStatusPollerQuery(TEST_SIGNATURE),
      {
        wrapper,
      },
    );
    await waitForValueToChange(() => result.current.data);

    expect(spyUseQuery).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      expect.objectContaining({
        refetchOnWindowFocus: false,
      }),
    );
  });
});

describe('useTransactionStatusPoller', () => {
  it('returns a successful status', async () => {
    mockGetTransactionStatus.mockResolvedValue({
      data: { confirmed: { success: true } } as TransactionStatusResponse,
    });
    const { result } = renderHook(() => useTransactionStatusPoller(), {
      wrapper,
    });
    const success = await result.current(TEST_SIGNATURE);

    expect(success).toBe(true);
  });

  it('returns an unsuccessful status', async () => {
    mockGetTransactionStatus.mockResolvedValue({
      data: { confirmed: { success: false } } as TransactionStatusResponse,
    });
    const { result } = renderHook(() => useTransactionStatusPoller(), {
      wrapper,
    });

    const success = await result.current(TEST_SIGNATURE);

    expect(success).toBe(false);
  });

  // Note: I attempted to get this test to behave correctly by using fake timers
  // but that ended up being a bigger headache than imagined. A lot of different
  // downstream dependencies are using `setTimeout`, and understanding how using
  // a fake timer affects those downstream dependencies was not worth figuring
  // out.
  it('should poll until confirmed', async () => {
    mockGetTransactionStatus.mockResolvedValue({
      data: { confirmed: undefined } as TransactionStatusResponse,
    });
    const { result } = renderHook(() => useTransactionStatusPoller(), {
      wrapper,
    });

    await act(async () => {
      // We deliberately send a short interval to speed up the test.
      const testPromise = result.current(TEST_SIGNATURE, /* intervalMs= */ 10);

      await new Promise<void>(resolve => {
        setTimeout(() => {
          mockGetTransactionStatus.mockResolvedValue({
            data: { confirmed: { success: true } } as TransactionStatusResponse,
          });
          resolve();
        }, 1000);
      });

      const success = await testPromise;
      expect(success).toBe(true);
      // This just does a loose sanity check that polling did indeed occur.
      // Though technically 1000 (one second ms) divided by 10 ms (injected
      // interval) is 100 times, the actual setTimeout callback in the
      // code-under-test runs closer to somewhere between 80 and 90 times.
      // Testing against this exact count is flaky, so we opt for > 50 to avoid
      // flakiness.
      expect(mockGetTransactionStatus.mock.calls.length).toBeGreaterThan(50);
    });
  });

  it(
    'throws an instance of FractalSDKTransactionStatusFetchInvalidError if ' +
      'an INVALID_ARGUMENT grpc status code is returned',
    async () => {
      mockGetTransactionStatus.mockResolvedValue({
        error: {
          code: GrpcStatusCode.INVALID_ARGUMENT,
        },
      });
      const { result } = renderHook(() => useTransactionStatusPoller(), {
        wrapper,
      });
      let error: unknown;

      try {
        await result.current(TEST_SIGNATURE);
      } catch (err: unknown) {
        error = err;
      }

      expect(error).toBeInstanceOf(
        FractalSDKTransactionStatusFetchInvalidError,
      );
    },
  );

  it(
    'throws an instance of FractalSDKTransactionStatusFetchUnknownError if ' +
      'an unrecognized status is returned',
    async () => {
      mockGetTransactionStatus.mockResolvedValue({
        error: {
          code: GrpcStatusCode.INTERNAL,
        },
      });
      const { result } = renderHook(() => useTransactionStatusPoller(), {
        wrapper,
      });
      let error: unknown;

      try {
        await result.current(TEST_SIGNATURE);
      } catch (err: unknown) {
        error = err;
      }

      expect(error).toBeInstanceOf(
        FractalSDKTransactionStatusFetchUnknownError,
      );
    },
  );
});
