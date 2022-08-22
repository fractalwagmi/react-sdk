import { Endpoint } from 'core/api/endpoints';
import { maybeIncludeAuthorizationHeaders } from 'core/api/headers';

const ACCESS_TOKEN = 'foobar';

describe('maybeIncludeAuthorizationHeaders', () => {
  it('returns an object with authorization header attached', () => {
    expect(
      maybeIncludeAuthorizationHeaders(ACCESS_TOKEN, Endpoint.GET_COINS),
    ).toEqual({
      authorization: `Bearer ${ACCESS_TOKEN}`,
    });
  });

  it('can use an existing object', () => {
    expect(
      maybeIncludeAuthorizationHeaders(ACCESS_TOKEN, Endpoint.GET_COINS, {
        foo: 'bar',
      }),
    ).toEqual({
      authorization: `Bearer ${ACCESS_TOKEN}`,
      foo: 'bar',
    });
  });
});
