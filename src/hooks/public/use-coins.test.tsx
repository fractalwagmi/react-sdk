import {
  FractalSdkCommonChain,
  FractalSdkWalletGetCoinsResponseCoin,
} from '@fractalwagmi/fractal-sdk-public-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import * as tokenModule from 'core/token';
import { TEST_ACCESS_TOKEN, TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useCoins } from 'hooks/public/use-coins';
import * as useUserModule from 'hooks/public/use-user';
import { act } from 'react-dom/test-utils';

jest.mock('core/api/client');
jest.mock('hooks/public/use-user');
jest.mock('core/token');

const ITEM_1: FractalSdkWalletGetCoinsResponseCoin = {
  address: 'test-address-1',
  chain: FractalSdkCommonChain.SOLANA,
  decimals: 111,
  logoUri: 'test-logo-1-uri.com',
  name: 'test-name-1',
  symbol: 'test-symbol-1',
  uiAmount: 'test-ui-amount-1',
};

const ITEM_2: FractalSdkWalletGetCoinsResponseCoin = {
  address: 'test-address-2',
  chain: FractalSdkCommonChain.SOLANA,
  decimals: 222,
  logoUri: 'test-logo-2-uri.com',
  name: 'test-name-2',
  symbol: 'test-symbol-2',
  uiAmount: 'test-ui-amount-2',
};

describe('useCoins', () => {
  let mockMaybeGetAccessToken: jest.SpyInstance;
  let mockGetCoins: jest.SpyInstance;
  let mockUseUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockMaybeGetAccessToken = jest.spyOn(tokenModule, 'maybeGetAccessToken');
    mockMaybeGetAccessToken.mockReturnValue(TEST_ACCESS_TOKEN);

    mockGetCoins = jest.spyOn(sdkApiClient.v1, 'getCoins');
    mockGetCoins.mockResolvedValue({ data: [] });

    mockUseUser = jest.spyOn(useUserModule, 'useUser');
    mockUseUser.mockReturnValue({
      data: TEST_FRACTAL_USER,
    } as ReturnType<typeof useUserModule.useUser>);

    wrapper = ({ children }) => (
      <FractalSDKContextProvider clientId="abc">
        {children}
      </FractalSDKContextProvider>
    );
  });

  afterEach(() => {
    mockGetCoins.mockReset();
    mockUseUser.mockReset();
  });

  it('returns the expected coins', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });
    const { result, waitForValueToChange } = renderHook(() => useCoins(), {
      wrapper,
    });
    expect(result.current.data).toEqual([]);

    await waitForValueToChange(() => result.current.data);

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1] } });
    const { result, waitForValueToChange } = renderHook(() => useCoins(), {
      wrapper,
    });
    await waitForValueToChange(() => result.current.data);
    expect(result.current.data).toEqual([ITEM_1]);
    mockGetCoins.mockResolvedValue({ data: { coins: [ITEM_1, ITEM_2] } });

    result.current.refetch();

    await waitForValueToChange(() => result.current.data);
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
