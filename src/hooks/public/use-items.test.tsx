import { FractalSdkWalletGetItemsResponseItem } from '@fractalwagmi/fractal-sdk-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import * as tokenModule from 'core/token';
import { TEST_ACCESS_TOKEN, TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useItems } from 'hooks/public/use-items';
import * as useUserModule from 'hooks/public/use-user';
import { act } from 'react-dom/test-utils';
import { SWRConfig } from 'swr';

jest.mock('core/token');
jest.mock('core/api/client');
jest.mock('hooks/public/use-user');

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
  let mockMaybeGetAccessToken: jest.SpyInstance;
  let mockGetWalletItems: jest.SpyInstance;
  let mockGetUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockMaybeGetAccessToken = jest.spyOn(tokenModule, 'maybeGetAccessToken');
    mockMaybeGetAccessToken.mockReturnValue(TEST_ACCESS_TOKEN);

    mockGetWalletItems = jest.spyOn(sdkApiClient.v1, 'getWalletItems');
    mockGetWalletItems.mockResolvedValue([]);

    mockGetUser = jest.spyOn(useUserModule, 'useUser');
    mockGetUser.mockReturnValue({
      data: TEST_FRACTAL_USER,
    } as ReturnType<typeof useUserModule.useUser>);

    wrapper = ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        <FractalSDKContextProvider clientId="abc">
          {children}
        </FractalSDKContextProvider>
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
    expect(result.current.data).toEqual([]);

    await act(async () => void {});

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetWalletItems.mockResolvedValue({ data: { items: [ITEM_1] } });
    const { result } = renderHook(() => useItems(), { wrapper });
    await act(async () => void {});
    expect(result.current.data).toEqual([ITEM_1]);
    mockGetWalletItems.mockResolvedValue({ data: { items: [ITEM_1, ITEM_2] } });

    await act(async () => {
      result.current.refetch();
    });

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
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

  it('attaches the correct access token to the request headers', async () => {
    renderHook(() => useItems(), { wrapper });
    await act(async () => void {});
    expect(mockGetWalletItems).toHaveBeenLastCalledWith(
      expect.objectContaining({
        headers: {
          authorization: `Bearer ${TEST_ACCESS_TOKEN}`,
        },
      }),
    );
  });
});
