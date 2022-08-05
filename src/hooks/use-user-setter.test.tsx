import { renderHook } from '@testing-library/react-hooks/dom';
import { UserContextProvider } from 'context/user';
import { sdkApiClient } from 'core/api/client';
import { useUser } from 'hooks/use-user';
import { useUserSetter } from 'hooks/use-user-setter';
import { useUserWallet } from 'hooks/use-user-wallet';
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

describe('useUserSetter', () => {
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
    const { result } = renderHook(() => useUserSetter());

    expect(typeof result.current.fetchAndSetFractalUser).toBe('function');
  });

  it('includes an authorization header when fetching user info', async () => {
    const { result } = renderHook(() => useUserSetter());

    await result.current.fetchAndSetFractalUser(DEFAULT_PARAMS);

    expect(mockGetInfo).lastCalledWith(
      expect.objectContaining({
        headers: EXPECTED_AUTHORIZATION_HEADER,
      }),
    );
  });

  describe('the setter', () => {
    it('returns an object with fractal user', async () => {
      const { result } = renderHook(() => useUserSetter());

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
      const { result } = renderHook(() => useUserSetter());

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
          const useUserSetterResult = useUserSetter();
          const useUserResult = useUser();
          // We have to return the result of 2 hooks here in this test hook
          // so that the hooks share the same `wrapper` context.
          return {
            useUserResult,
            useUserSetterResult,
          };
        },
        { wrapper },
      );

      await act(async () => {
        await result.current.useUserSetterResult.fetchAndSetFractalUser(
          DEFAULT_PARAMS,
        );
      });

      expect(result.current.useUserResult.fractalUser).toEqual({
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
          const useUserSetterResult = useUserSetter();
          const useUserWalletResult = useUserWallet();
          // We have to return the result of 2 hooks here in this test hook
          // so that the hooks share the same `wrapper` context.
          return {
            useUserSetterResult,
            useUserWalletResult,
          };
        },
        { wrapper },
      );

      await act(async () => {
        await result.current.useUserSetterResult.fetchAndSetFractalUser(
          DEFAULT_PARAMS,
        );
      });

      expect(result.current.useUserWalletResult.fractalUserWallet).toEqual({
        solanaPublicKeys: [TEST_SOLANA_PUBLIC_KEY],
      });
    });
  });
});
