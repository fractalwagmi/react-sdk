import { FractalWebsdkTransactionGetTransactionStatusResponse } from '@fractalwagmi/fractal-sdk-websdk-api';
import * as reactQuery from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { webSdkApiClient } from 'core/api/client';
import { TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useUser } from 'hooks/public/use-user';
import { useGetTransactionStatusPollerQuery } from 'queries/transaction';

jest.mock('hooks/public/use-user');
jest.mock('core/api/client');
jest.mock('core/api/client');

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
    <reactQuery.QueryClientProvider client={queryClient}>
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
    } as FractalWebsdkTransactionGetTransactionStatusResponse,
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
