import { FractalSdkWalletGetCoinsResponseCoin } from '@fractalwagmi/fractal-sdk-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { UserContextProvider } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { TEST_FRACTAL_USER } from 'hooks/testing/constants';
import { useFractalCoins } from 'hooks/use-fractal-coins';
import * as useFractalUserModule from 'hooks/use-fractal-user';
import { act } from 'react-dom/test-utils';
import { SWRConfig } from 'swr';

jest.mock('core/api/client');
jest.mock('hooks/use-fractal-user');

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

describe('useFractalCoins', () => {
  let mockGetCoins: jest.SpyInstance;
  let mockGetUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockGetCoins = jest.spyOn(sdkApiClient.v1, 'getCoins');
    mockGetCoins.mockResolvedValue([]);

    mockGetUser = jest.spyOn(useFractalUserModule, 'useFractalUser');
    mockGetUser.mockReturnValue({
      fractalUser: TEST_FRACTAL_USER,
    });

    wrapper = ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        <UserContextProvider>{children}</UserContextProvider>
      </SWRConfig>
    );
  });

  afterEach(() => {
    mockGetCoins.mockReset();
    mockGetUser.mockReset();
  });

  it('returns the expected coins', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });
    const { result } = renderHook(() => useFractalCoins(), { wrapper });
    expect(result.current.fractalCoins).toEqual([]);

    await act(async () => void {});

    expect(result.current.fractalCoins).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1] } });
    const { result } = renderHook(() => useFractalCoins(), { wrapper });
    await act(async () => void {});
    expect(result.current.fractalCoins).toEqual([ITEM_1]);
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });

    await act(async () => {
      result.current.refetch();
    });

    expect(result.current.fractalCoins).toEqual([ITEM_1, ITEM_2]);
  });

  it('only makes one network request until refetch is called', async () => {
    const { rerender, result } = renderHook(() => useFractalCoins(), {
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
