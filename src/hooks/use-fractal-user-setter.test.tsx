import { renderHook } from '@testing-library/react-hooks/dom';
import { UserContextProvider } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { useFractalUser } from 'hooks/use-fractal-user';
import { useFractalUserSetter } from 'hooks/use-fractal-user-setter';
import { useFractalUserWallet } from 'hooks/use-fractal-user-wallet';
import { act } from 'react-dom/test-utils';

jest.mock('core/api/client');
jest.mock('core/api/headers');

const TEST_ACCESS_TOKEN = 'foo';
const TEST_USER_ID = 'bar';
const TEST_EMAIL = 'foo@bar.com';
const TEST_USERNAME = 'foo_bar';
const TEST_SOLANA_PUBLIC_KEY = 'solana-key';
const EXPECTED_AUTHORIZATION_HEADER = {
  authorization: `Bearer ${TEST_ACCESS_TOKEN}`,
};
const DEFAULT_PARAMS = {
  accessToken: TEST_ACCESS_TOKEN,
  userId: TEST_USER_ID,
};

describe('useFractalUserSetter', () => {
  let mockGetInfo: jest.Mock;

  beforeEach(() => {
    mockGetInfo = sdkApiClient.v1.getInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      data: {
        accountPublicKey: TEST_SOLANA_PUBLIC_KEY,
        email: TEST_EMAIL,
        username: TEST_USERNAME,
      },
    });
  });

  it('returns a callable function', () => {
    const { result } = renderHook(() => useFractalUserSetter());

    expect(typeof result.current.fetchAndSetFractalUser).toBe('function');
  });

  it('includes an authorization header when fetching user info', async () => {
    const { result } = renderHook(() => useFractalUserSetter());

    await result.current.fetchAndSetFractalUser(DEFAULT_PARAMS);

    expect(mockGetInfo).lastCalledWith(
      expect.objectContaining({
        headers: EXPECTED_AUTHORIZATION_HEADER,
      }),
    );
  });

  describe('the setter', () => {
    it('returns an object with fractal user', async () => {
      const { result } = renderHook(() => useFractalUserSetter());

      const { fractalUser } = await result.current.fetchAndSetFractalUser(
        DEFAULT_PARAMS,
      );

      expect(fractalUser).toEqual({
        accessToken: TEST_ACCESS_TOKEN,
        email: TEST_EMAIL,
        userId: TEST_USER_ID,
        username: TEST_USERNAME,
      });
    });

    it('returns an object with fractal user wallet', async () => {
      const { result } = renderHook(() => useFractalUserSetter());

      const { fractalUserWallet } = await result.current.fetchAndSetFractalUser(
        DEFAULT_PARAMS,
      );

      expect(fractalUserWallet).toEqual({
        solanaPublicKeys: [TEST_SOLANA_PUBLIC_KEY],
      });
    });

    it('sets a fractal user for the wrapping `UserContext`', async () => {
      const wrapper: React.FC = ({ children }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );
      const { result } = renderHook(
        () => {
          const useFractalUserSetterResult = useFractalUserSetter();
          const useFractalUserResult = useFractalUser();
          // We have to return the result of 2 hooks here in this test hook
          // so that the hooks share the same `wrapper` context.
          return {
            useFractalUserResult,
            useFractalUserSetterResult,
          };
        },
        { wrapper },
      );

      await act(async () => {
        await result.current.useFractalUserSetterResult.fetchAndSetFractalUser(
          DEFAULT_PARAMS,
        );
      });

      expect(result.current.useFractalUserResult.fractalUser).toEqual({
        accessToken: TEST_ACCESS_TOKEN,
        email: TEST_EMAIL,
        userId: TEST_USER_ID,
        username: TEST_USERNAME,
      });
    });

    it('sets a fractal user wallet for the wrapping `UserContext`', async () => {
      const wrapper: React.FC = ({ children }) => (
        <UserContextProvider>{children}</UserContextProvider>
      );
      const { result } = renderHook(
        () => {
          const useFractalUserSetterResult = useFractalUserSetter();
          const useFractalUserWalletResult = useFractalUserWallet();
          // We have to return the result of 2 hooks here in this test hook
          // so that the hooks share the same `wrapper` context.
          return {
            useFractalUserSetterResult,
            useFractalUserWalletResult,
          };
        },
        { wrapper },
      );

      await act(async () => {
        await result.current.useFractalUserSetterResult.fetchAndSetFractalUser(
          DEFAULT_PARAMS,
        );
      });

      expect(
        result.current.useFractalUserWalletResult.fractalUserWallet,
      ).toEqual({
        solanaPublicKeys: [TEST_SOLANA_PUBLIC_KEY],
      });
    });
  });
});
