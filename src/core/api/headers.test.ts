import { sdkApiClient } from 'core/api/client';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';

const ACCESS_TOKEN = 'foobar';

describe('maybeIncludeAuthorizationHeaders', () => {
  it('returns an object with authorization header attached', () => {
    expect(
      maybeIncludeAuthorizationHeaders(ACCESS_TOKEN, sdkApiClient.v1.getCoins),
    ).toEqual({
      authorization: `Bearer ${ACCESS_TOKEN}`,
    });
  });

  it('can use an existing object', () => {
    expect(
      maybeIncludeAuthorizationHeaders(ACCESS_TOKEN, sdkApiClient.v1.getCoins, {
        foo: 'bar',
      }),
    ).toEqual({
      authorization: `Bearer ${ACCESS_TOKEN}`,
      foo: 'bar',
    });
  });
});
