import jwtDecode, { JwtPayload } from 'jwt-decode';
import { secondsInMs } from 'lib/util/time';
import { BaseUser } from 'types';

const LS_KEY_USER_ID = 'xjnSUQnpZU';
const LS_KEY_ACCESS_TOKEN = 'QhiUizqDML';

interface StoreIdAndTokenParameters {
  accessToken: string;
  userId: string;
}
/** Stores the accessToken and userId to localStorage. */
export function storeIdAndTokenInLS({
  accessToken,
  userId,
}: StoreIdAndTokenParameters) {
  if (!window.localStorage) {
    return;
  }

  window.localStorage.setItem(LS_KEY_USER_ID, userId);
  window.localStorage.setItem(LS_KEY_ACCESS_TOKEN, accessToken);
}

export function clearIdAndTokenInLS() {
  window.localStorage.removeItem(LS_KEY_USER_ID);
  window.localStorage.removeItem(LS_KEY_ACCESS_TOKEN);
}

/**
 * Returns the base user from localStorage only if it exists and the stored
 * token is unexpired.
 */
export function maybeGetBaseUser(): BaseUser | undefined {
  if (!window.localStorage) {
    return;
  }

  const accessToken = maybeGetAccessToken();
  const userId = window.localStorage.getItem(LS_KEY_USER_ID);

  if (!accessToken && userId) {
    window.localStorage.removeItem(LS_KEY_USER_ID);
  }

  if (!accessToken || !userId) {
    return;
  }

  return {
    userId,
  };
}

export function maybeGetAccessToken(): string | undefined {
  const accessToken = window.localStorage.getItem(LS_KEY_ACCESS_TOKEN);
  if (!accessToken || isTokenExpired(accessToken)) {
    window.localStorage.removeItem(LS_KEY_ACCESS_TOKEN);
    return;
  }
  return accessToken;
}

function isTokenExpired(accessToken: string): boolean {
  if (!window.localStorage) {
    return true;
  }

  if (!accessToken) {
    return true;
  }
  const decoded = jwtDecode<JwtPayload>(accessToken);
  // decoded.exp is an expiration timestamp in seconds.
  const expirationTimestampInSeconds = decoded.exp;
  if (expirationTimestampInSeconds === undefined) {
    return false;
  }
  const expirationTimestampMs = secondsInMs(expirationTimestampInSeconds);
  return expirationTimestampMs < Date.now();
}
