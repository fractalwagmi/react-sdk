import { verifyScopes } from 'core/scope';

describe('verifyScopes', () => {
  it('identifies invalid scope values', () => {
    expect(verifyScopes(['abc'])).toBe(false);
    expect(verifyScopes(['coins_read'])).toBe(false);
    expect(verifyScopes(['items_read'])).toBe(false);
    expect(verifyScopes(['read:coins'])).toBe(false);
    expect(verifyScopes(['read:items'])).toBe(false);
    expect(verifyScopes(['identity'])).toBe(false);
  });

  it('identifies correct scope values', () => {
    expect(verifyScopes(['coins:read'])).toBe(true);
    expect(verifyScopes(['items:read'])).toBe(true);
    expect(verifyScopes(['identify'])).toBe(true);
    expect(verifyScopes(['identify', 'coins:read'])).toBe(true);
    expect(verifyScopes(['identify', 'items:read'])).toBe(true);
    expect(verifyScopes(['identify', 'coins:read', 'items:read'])).toBe(true);
  });

  it('does not take into account the order of scopes', () => {
    expect(verifyScopes(['coins:read', 'items:read'])).toBe(true);
    expect(verifyScopes(['items:read', 'coins:read'])).toBe(true);
  });
});
