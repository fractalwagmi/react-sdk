import { validateOrigin } from 'core/messaging';

describe('validateOrigin', () => {
  it('behaves as expected', () => {
    expect(validateOrigin('https://www.fractal.is')).toBe(true);
    expect(validateOrigin('https://fractal.is')).toBe(true);
    expect(validateOrigin('http://www.fractal.is')).toBe(false);
    expect(validateOrigin('http://fractal.is')).toBe(false);
    expect(validateOrigin('https://some-other-domain.com')).toBe(false);
  });
});
