import { maybeGetBaseUser, storeIdAndTokenInLS } from 'core/token';
import jwtDecode from 'jwt-decode';

jest.mock('jwt-decode');

const LS_KEY_USER_ID = 'xjnSUQnpZU';
const LS_KEY_ACCESS_TOKEN = 'QhiUizqDML';

describe('storeIdAndTokenInLS', () => {
  it('stores the userID and accessToken in local storage', () => {
    storeIdAndTokenInLS({ accessToken: 'foo', userId: 'bar' });
    expect(localStorage.getItem(LS_KEY_ACCESS_TOKEN)).toBe('foo');
    expect(localStorage.getItem(LS_KEY_USER_ID)).toBe('bar');
  });
});

describe('maybeGetBaseUser', () => {
  const SOME_TIMESTAMP_IN_THE_PAST_SEC = (Date.now() - 50000) / 1000;
  const SOME_TIMESTAMP_IN_THE_FUTURE_SEC = (Date.now() + 50000) / 1000;

  it('does not retrieve the base user if token is expired', () => {
    storeIdAndTokenInLS({ accessToken: 'foo', userId: 'bar' });
    (jwtDecode as jest.Mock).mockReturnValue({
      exp: SOME_TIMESTAMP_IN_THE_PAST_SEC,
    });
    expect(maybeGetBaseUser()).toBeUndefined();
  });

  it('retrieves the base usser if token is unexpired', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      exp: SOME_TIMESTAMP_IN_THE_FUTURE_SEC,
    });
    storeIdAndTokenInLS({ accessToken: 'foo', userId: 'bar' });

    expect(maybeGetBaseUser()).toEqual({
      userId: 'bar',
    });
  });

  it('returns undefined if only accessToken is stored in localStorage', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      exp: SOME_TIMESTAMP_IN_THE_FUTURE_SEC,
    });
    storeIdAndTokenInLS({ accessToken: 'foo', userId: 'bar' });
    localStorage.removeItem(LS_KEY_USER_ID);

    expect(maybeGetBaseUser()).toBeUndefined();
  });

  it('returns undefined if only userId is stored in localStorage', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      exp: SOME_TIMESTAMP_IN_THE_FUTURE_SEC,
    });
    storeIdAndTokenInLS({ accessToken: 'foo', userId: 'bar' });
    localStorage.removeItem(LS_KEY_ACCESS_TOKEN);

    expect(maybeGetBaseUser()).toBeUndefined();
  });
});
