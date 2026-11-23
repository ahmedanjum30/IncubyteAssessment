import { describe, expect, it } from 'vitest';
import { money, signedUsd, usdCompact } from './format';

describe('money formatting', () => {
  it('shows local currency with its own symbol and no cents', () => {
    expect(money(61_000, 'EUR')).toBe('€61,000');
    expect(money(2_940_000, 'INR')).toBe('₹2,940,000');
  });

  it('signs gaps so below-band amounts read as negative', () => {
    expect(signedUsd(-2_100)).toBe('−$2,100');
    expect(signedUsd(450)).toBe('+$450');
    expect(signedUsd(0)).toBe('$0');
  });

  it('compacts large USD values for chart labels', () => {
    expect(usdCompact(131_000)).toBe('$131K');
  });
});
