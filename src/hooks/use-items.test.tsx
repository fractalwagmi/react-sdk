import { FractalSdkWalletGetItemsResponseItem } from '@fractalwagmi/fractal-sdk-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { UserContextProvider } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { TEST_FRACTAL_USER } from 'hooks/testing/constants';
import { useItems } from 'hooks/use-items';
import * as useUserModule from 'hooks/use-user';
import { act } from 'react-dom/test-utils';
import { SWRConfig } from 'swr';

jest.mock('core/api/client');
jest.mock('hooks/use-fractal-user');

const ITEM_1: FractalSdkWalletGetItemsResponseItem = {
  files: [
    {
      type: 'jpeg',
      uri: 'foo1.jpg',
    },
    {
      type: 'jpeg',
      uri: 'foo2.jpg',
    },
  ],
  id: 'foo-id',
  name: 'foo',
};

const ITEM_2: FractalSdkWalletGetItemsResponseItem = {
  files: [
    {
      type: 'jpeg',
      uri: 'bar1.jpg',
    },
    {
      type: 'jpeg',
      uri: 'bar2.jpg',
    },
  ],
  id: 'bar-id',
  name: 'bar',
};

describe('useItems', () => {
  let mockGetWalletItems: jest.SpyInstance;
  let mockGetUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockGetWalletItems = jest.spyOn(sdkApiClient.v1, 'getWalletItems');
    mockGetWalletItems.mockResolvedValue([]);

    mockGetUser = jest.spyOn(useUserModule, 'useUser');
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
    mockGetWalletItems.mockReset();
    mockGetUser.mockReset();
  });

  it('returns the expected items', async () => {
    mockGetWalletItems.mockResolvedValue({ data: { items: [ITEM_1, ITEM_2] } });
    const { result } = renderHook(() => useItems(), { wrapper });
    expect(result.current.fractalItems).toEqual([]);

    await act(async () => void {});

    expect(result.current.fractalItems).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetWalletItems.mockResolvedValue({ data: { items: [ITEM_1] } });
    const { result } = renderHook(() => useItems(), { wrapper });
    await act(async () => void {});
    expect(result.current.fractalItems).toEqual([ITEM_1]);
    mockGetWalletItems.mockResolvedValue({ data: { items: [ITEM_1, ITEM_2] } });

    await act(async () => {
      result.current.refetch();
    });

    expect(result.current.fractalItems).toEqual([ITEM_1, ITEM_2]);
  });

  it('only makes one network request until refetch is called', async () => {
    const { rerender, result } = renderHook(() => useItems(), {
      wrapper,
    });
    await act(async () => void {});
    expect(mockGetWalletItems).toHaveBeenCalledTimes(1);
    await act(async () => rerender());
    await act(async () => rerender());
    expect(mockGetWalletItems).toHaveBeenCalledTimes(1);

    await act(async () => result.current.refetch());

    expect(mockGetWalletItems).toHaveBeenCalledTimes(2);
  });
});
