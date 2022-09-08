import { CURRENT_SDK_VERSION } from 'config/build-variables';
import { getDefaultHeaders, getDefaultSecureHeaders } from 'core/api/headers';
import { FractalSDKAuthenticationError } from 'core/error';
import { TEST_ACCESS_TOKEN } from 'hooks/__data__/constants';

const LS_KEY_ACCESS_TOKEN = 'QhiUizqDML';

beforeEach(() => {
  localStorage.setItem(LS_KEY_ACCESS_TOKEN, TEST_ACCESS_TOKEN);
});

afterEach(() => {
  localStorage.clear();
});

describe('getDefaultSecureHeaders', () => {
  it('returns an object with authorization header attached', () => {
    expect(getDefaultSecureHeaders()).toEqual(
      expect.objectContaining({
        authorization: `Bearer ${TEST_ACCESS_TOKEN}`,
      }),
    );
  });

  it('throws an error if no accessToken exists', () => {
    localStorage.clear();
    expect(() => {
      getDefaultSecureHeaders();
    }).toThrow(FractalSDKAuthenticationError);
  });
});

describe('getDefaultHeaders', () => {
  it('returns an object with the sdk version attached', () => {
    expect(getDefaultHeaders()).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'fractal-web-sdk-version': CURRENT_SDK_VERSION,
      }),
    );
  });
});
