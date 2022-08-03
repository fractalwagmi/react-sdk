import { renderHook } from '@testing-library/react-hooks/dom';
import { authApiClient } from 'core/api/client';
import { useAuthUrl } from 'hooks/use-auth-url';
import { act } from 'react-dom/test-utils';
import { Scope } from 'types/scope';

jest.mock('core/api/client');

const TEST_CLIENT_ID = 'clientId';
const TEST_RETURNED_CODE = 'code-foobar';
const TEST_RETURNED_URL = 'url-foobar.com';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const DO_NOTHING = () => {};
const DEFAULT_PARAMS = { clientId: TEST_CLIENT_ID, onError: DO_NOTHING };

describe('useAuthUrl', () => {
  beforeEach(() => {
    (authApiClient.v2.getUrl as jest.Mock).mockResolvedValue({
      data: {
        code: TEST_RETURNED_CODE,
        url: TEST_RETURNED_URL,
      },
    });

    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });

  describe('scopes', () => {
    it('logs an error when invalid scopes are passed', () => {
      renderHook(() =>
        useAuthUrl({
          clientId: TEST_CLIENT_ID,
          onError: DO_NOTHING,
          scopes: ['invalid-scope' as Scope],
        }),
      );

      // eslint-disable-next-line no-console
      expect((console.error as jest.Mock).mock.lastCall[0]).toBeDefined();
    });

    it('defaults to using [Scope.IDENTIFY] for an undefined `scope`', () => {
      const INTENTIONALLY_MISSING_SCOPES = {
        clientId: TEST_CLIENT_ID,
        onError: DO_NOTHING,
      };
      renderHook(() => useAuthUrl(INTENTIONALLY_MISSING_SCOPES));

      expect(authApiClient.v2.getUrl).lastCalledWith(
        expect.objectContaining({
          scope: [Scope.IDENTIFY],
        }),
      );
    });

    it('relays the scope to the SDK API', () => {
      renderHook(() =>
        useAuthUrl({
          clientId: TEST_CLIENT_ID,
          onError: DO_NOTHING,
          scopes: [Scope.COINS_READ, Scope.ITEMS_READ, Scope.IDENTIFY],
        }),
      );

      expect(authApiClient.v2.getUrl).lastCalledWith(
        expect.objectContaining({
          scope: [Scope.COINS_READ, Scope.ITEMS_READ, Scope.IDENTIFY],
        }),
      );
    });
  });

  it('relays the clientId to the SDK API', () => {
    renderHook(() =>
      useAuthUrl({
        clientId: TEST_CLIENT_ID,
        onError: DO_NOTHING,
      }),
    );

    expect(authApiClient.v2.getUrl).lastCalledWith(
      expect.objectContaining({
        clientId: TEST_CLIENT_ID,
      }),
    );
  });

  it('returns the expected code and url', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAuthUrl(DEFAULT_PARAMS),
    );

    expect(result.current.code).toBe(undefined);
    expect(result.current.url).toBe(undefined);

    await waitForNextUpdate();

    expect(result.current.code).toBe(TEST_RETURNED_CODE);
    expect(result.current.url).toBe(TEST_RETURNED_URL);
  });

  it('calls `onError` when an error occurs', async () => {
    const error = new Error('some error');
    (authApiClient.v2.getUrl as jest.Mock).mockRejectedValueOnce(error);
    const onError = jest.fn();
    renderHook(() =>
      useAuthUrl({
        ...DEFAULT_PARAMS,
        onError,
      }),
    );

    // Await the rejected promise.
    await act(async () => {
      await 0;
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});
