import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks/dom';
import { TEST_FRACTAL_USER } from 'hooks/__data__/constants';
import { useUser } from 'hooks/public/use-user';
import { useGetItemsForSaleQuery } from 'queries/items';

jest.mock('@tanstack/react-query');
jest.mock('hooks/public/use-user');

let mockUseQuery: jest.Mock;
let mockUseUser: jest.Mock;

beforeEach(() => {
  mockUseQuery = useQuery as jest.Mock;

  mockUseUser = useUser as jest.Mock;
  mockUseUser.mockReturnValue({
    data: TEST_FRACTAL_USER,
  });
});

afterEach(() => {
  mockUseQuery.mockReset();
});

describe('useGetItemsForSaleQuery', () => {
  // Ensures that logging out invalidates the cache.
  it('uses the userId as a query cache key', () => {
    renderHook(() =>
      useGetItemsForSaleQuery({
        limit: 1,
        sortDirection: 'DESCENDING',
        sortField: 'LIST_TIME',
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.arrayContaining([TEST_FRACTAL_USER.userId]),
      expect.any(Function),
      expect.any(Object),
    );
  });
});
