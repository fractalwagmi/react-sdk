import { renderHook } from '@testing-library/react-hooks/dom';
import { useAuthButtonProps } from 'hooks/public/use-auth-button-props';
import { useSignIn } from 'hooks/use-sign-in';
import { act } from 'react-dom/test-utils';

jest.mock('hooks/use-sign-in');

let useSignInMock: jest.Mock;
let signInMock: jest.Mock;
let onSignInCallback: () => null;

beforeEach(() => {
  signInMock = jest.fn();
  useSignInMock = useSignIn as jest.Mock;
  useSignInMock.mockImplementation(({ onSignIn }) => {
    onSignInCallback = onSignIn;
    return { signIn: signInMock };
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

it('should return a loading bit that is true while signing in', () => {
  const { result } = renderHook(() => useAuthButtonProps());
  expect(result.current.loading).toBe(false);

  act(() => result.current.onClick());

  expect(result.current.loading).toBe(true);

  act(() => {
    onSignInCallback();
  });

  expect(result.current.loading).toBe(false);
});
