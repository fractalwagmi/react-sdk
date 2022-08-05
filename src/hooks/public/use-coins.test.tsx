import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/fractal-sdk-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { UserContextProvider } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { useCoins } from 'hooks/public/use-coins';
import * as useUserModule from 'hooks/public/use-user';
import { TEST_FRACTAL_USER } from 'hooks/testing/constants';
import { act } from 'react-dom/test-utils';
import { SWRConfig } from 'swr';

jest.mock('core/api/client');
jest.mock('hooks/public/use-user');

const ITEM_1: FractalSdkWalletGetCoinsResponseCoin = {
  address: 'test-address-1',
  amount: 'test-amount-1',
  decimals: 111,
  logoUri: 'test-logo-1-uri.com',
  name: 'test-name-1',
  symbol: 'test-symbol-1',
  uiAmount: 'test-ui-amount-1',
};

const ITEM_2: FractalSdkWalletGetCoinsResponseCoin = {
  address: 'test-address-2',
  amount: 'test-amount-2',
  decimals: 222,
  logoUri: 'test-logo-2-uri.com',
  name: 'test-name-2',
  symbol: 'test-symbol-2',
  uiAmount: 'test-ui-amount-2',
};

describe('useCoins', () => {
  let mockGetCoins: jest.SpyInstance;
  let mockUseUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockGetCoins = jest.spyOn(sdkApiClient.v1, 'getCoins');
    mockGetCoins.mockResolvedValue([]);

    mockUseUser = jest.spyOn(useUserModule, 'useUser');
    mockUseUser.mockReturnValue({
      data: TEST_FRACTAL_USER,
    } as ReturnType<typeof useUserModule.useUser>);

    wrapper = ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        <UserContextProvider>{children}</UserContextProvider>
      </SWRConfig>
    );
  });

  afterEach(() => {
    mockGetCoins.mockReset();
    mockUseUser.mockReset();
  });

  it('returns the expected coins', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });
    const { result } = renderHook(() => useCoins(), { wrapper });
    expect(result.current.data).toEqual([]);

    await act(async () => void {});

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1] } });
    const { result } = renderHook(() => useCoins(), { wrapper });
    await act(async () => void {});
    expect(result.current.data).toEqual([ITEM_1]);
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });

    await act(async () => {
      result.current.refetch();
    });

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('only makes one network request until refetch is called', async () => {
    const { rerender, result } = renderHook(() => useCoins(), {
      wrapper,
    });
    await act(async () => void {});
    expect(mockGetCoins).toHaveBeenCalledTimes(1);
    await act(async () => rerender());
    await act(async () => rerender());
    expect(mockGetCoins).toHaveBeenCalledTimes(1);

    await act(async () => result.current.refetch());

    expect(mockGetCoins).toHaveBeenCalledTimes(2);
  });
});
