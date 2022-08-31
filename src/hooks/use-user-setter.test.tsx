import { renderHook } from '@testing-library/react-hooks/dom';
import { FractalSDKContextProvider } from 'context/fractal-sdk-context';
import { sdkApiClient } from 'core/api/client';
import { useUser } from 'hooks/public/use-user';
import { useUserWallet } from 'hooks/public/use-user-wallet';
import { useUserSetter } from 'hooks/use-user-setter';
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

  it('includes an authorization header when fetching user info', async () => {
    const { result } = renderHook(() => useUserSetter());

    await result.current.fetchAndSetUser(DEFAULT_PARAMS, TEST_ACCESS_TOKEN);

    expect(mockGetInfo).lastCalledWith(
      expect.objectContaining({
        headers: EXPECTED_AUTHORIZATION_HEADER,
      }),
    );
  });

  describe('the setter', () => {
    it('returns an object with fractal user', async () => {
      const { result } = renderHook(() => useUserSetter());

      const { user } = await result.current.fetchAndSetUser(
        DEFAULT_PARAMS,
        TEST_ACCESS_TOKEN,
      );

      expect(user).toEqual({
        email: TEST_EMAIL,
        userId: TEST_USER_ID,
        username: TEST_USERNAME,
      });
    });

    it('returns an object with fractal user wallet', async () => {
      const { result } = renderHook(() => useUserSetter());

      const { userWallet } = await result.current.fetchAndSetUser(
        DEFAULT_PARAMS,
        TEST_ACCESS_TOKEN,
      );

      expect(userWallet).toEqual({
        solanaPublicKeys: [TEST_SOLANA_PUBLIC_KEY],
      });
    });

    it('sets a fractal user for the wrapping `UserContext`', async () => {
      const wrapper: React.FC = ({ children }) => (
        <FractalSDKContextProvider clientId="abc">
          {children}
        </FractalSDKContextProvider>
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
        await result.current.useUserSetterResult.fetchAndSetUser(
          DEFAULT_PARAMS,
          TEST_ACCESS_TOKEN,
        );
      });

      expect(result.current.useUserResult.data).toEqual({
        email: TEST_EMAIL,
        userId: TEST_USER_ID,
        username: TEST_USERNAME,
      });
    });

    it('sets a fractal user wallet for the wrapping `UserContext`', async () => {
      const wrapper: React.FC = ({ children }) => (
        <FractalSDKContextProvider clientId="abc">
          {children}
        </FractalSDKContextProvider>
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
        await result.current.useUserSetterResult.fetchAndSetUser(
          DEFAULT_PARAMS,
          TEST_ACCESS_TOKEN,
        );
      });

      expect(result.current.useUserWalletResult.data).toEqual({
        solanaPublicKeys: [TEST_SOLANA_PUBLIC_KEY],
      });
    });
  });
});
