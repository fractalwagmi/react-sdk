import { FractalSdkSolanaGetForSaleItemsResponseItem } from '@fractalwagmi/fractal-sdk-public-api';
import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { webSdkApiClient } from 'core/api/client';
import * as tokenModule from 'core/token';
import { TEST_ACCESS_TOKEN, TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useItemsForSale } from 'hooks/public/use-items-for-sale';
import * as useUserModule from 'hooks/public/use-user';
import { act } from 'react-dom/test-utils';

jest.mock('core/token');
jest.mock('core/api/client');
jest.mock('hooks/public/use-user');

const ITEM_1: FractalSdkSolanaGetForSaleItemsResponseItem = {
  id: 'foo-id',
  imageUrl: 'https://google.com/foo.png',
  listTime: {
    epochMillis: '100',
    time: '100',
  },
  name: 'foo',
  price: {
    amount: '5',
    unit: 'sol',
  },
};

const ITEM_2: FractalSdkSolanaGetForSaleItemsResponseItem = {
  id: 'bar-id',
  imageUrl: 'https://google.com/bar.png',
  listTime: {
    epochMillis: '200',
    time: '200',
  },
  name: 'bar',
  price: {
    amount: '10',
    unit: 'sol',
  },
};

describe('useItemsForSale', () => {
  let mockMaybeGetAccessToken: jest.SpyInstance;
  let mockGetForSaleItems: jest.SpyInstance;
  let mockGetUser: jest.SpyInstance;
  let wrapper: React.FC;

  beforeEach(() => {
    mockMaybeGetAccessToken = jest.spyOn(tokenModule, 'maybeGetAccessToken');
    mockMaybeGetAccessToken.mockReturnValue(TEST_ACCESS_TOKEN);

    mockGetForSaleItems = jest.spyOn(webSdkApiClient.websdk, 'getForSaleItems');
    mockGetForSaleItems.mockResolvedValue({ data: [] });

    mockGetUser = jest.spyOn(useUserModule, 'useUser');
    mockGetUser.mockReturnValue({
      data: TEST_FRACTAL_USER,
    } as ReturnType<typeof useUserModule.useUser>);

    wrapper = ({ children }) => (
      <FractalSDKContextProvider clientId="abc">
        {children}
      </FractalSDKContextProvider>
    );
  });

  afterEach(() => {
    mockGetForSaleItems.mockReset();
    mockGetUser.mockReset();
  });

  it('returns the expected items', async () => {
    mockGetForSaleItems.mockResolvedValue({
      data: { items: [ITEM_1, ITEM_2] },
    });
    const { result, waitForValueToChange } = renderHook(
      () => useItemsForSale(),
      {
        wrapper,
      },
    );
    expect(result.current.data).toEqual(undefined);

    await waitForValueToChange(() => result.current.data);

    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('returns a refetcher to trigger a new fetch', async () => {
    mockGetForSaleItems.mockResolvedValue({ data: { items: [ITEM_1] } });
    const { result, waitForValueToChange } = renderHook(
      () => useItemsForSale(),
      {
        wrapper,
      },
    );
    await waitForValueToChange(() => result.current.data);
    expect(result.current.data).toEqual([ITEM_1]);
    mockGetForSaleItems.mockResolvedValue({
      data: { items: [ITEM_1, ITEM_2] },
    });

    result.current.refetch();

    await waitForValueToChange(() => result.current.data);
    expect(result.current.data).toEqual([ITEM_1, ITEM_2]);
  });

  it('only makes one network request until refetch is called', async () => {
    const { rerender, result } = renderHook(() => useItemsForSale(), {
      wrapper,
    });
    await act(async () => void {});
    expect(mockGetForSaleItems).toHaveBeenCalledTimes(1);
    await act(async () => rerender());
    await act(async () => rerender());
    expect(mockGetForSaleItems).toHaveBeenCalledTimes(1);

    await act(async () => result.current.refetch());

    expect(mockGetForSaleItems).toHaveBeenCalledTimes(2);
  });

  it('passes the correct params to the fetcher', async () => {
    renderHook(
      () =>
        useItemsForSale({
          limit: 200,
          sortDirection: 'ASCENDING',
          sortField: 'PRICE',
        }),
      { wrapper },
    );
    await act(async () => void {});
    expect(mockGetForSaleItems).toHaveBeenCalledWith({
      limit: 200,
      /* eslint-disable @typescript-eslint/naming-convention */
      'sort.direction': 'ASCENDING',
      'sort.field': 'PRICE',
      /* eslint-enable @typescript-eslint/naming-convention */
    });
  });
});
