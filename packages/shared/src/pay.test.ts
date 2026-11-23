import { describe, expect, it } from 'vitest';
import { bandFor, bandStatus, gapToBand, roundSalary, toUsd } from './pay.js';

describe('pay rules', () => {
  it('converts local currency to USD to the cent', () => {
    expect(toUsd(61_000, 1.085)).toBe(66_185);
    expect(toUsd(2_940_000, 0.012)).toBe(35_280);
  });

  it('classifies a salary against its band', () => {
    const band = { min: 50_000, max: 70_000 };
    expect(bandStatus(49_999, band)).toBe('below');
    expect(bandStatus(50_000, band)).toBe('within');
    expect(bandStatus(70_000, band)).toBe('within');
    expect(bandStatus(70_001, band)).toBe('above');
  });

  it('reports the gap to the nearest band edge, zero when within', () => {
    const band = { min: 50_000, max: 70_000 };
    expect(gapToBand(45_000, band)).toBe(-5_000);
    expect(gapToBand(60_000, band)).toBe(0);
    expect(gapToBand(72_000, band)).toBe(2_000);
  });

  it('builds bands in local currency that grow with level', () => {
    const l3 = bandFor('DE', 'Engineering', 3);
    const l4 = bandFor('DE', 'Engineering', 4);
    expect(l3.min).toBeLessThan(l3.max);
    expect(l4.min).toBeGreaterThan(l3.min);
    expect(bandFor('IN', 'Engineering', 3).min).toBeGreaterThan(l3.min);
  });

  it('rounds salaries to sensible steps for the currency size', () => {
    expect(roundSalary(61_240)).toBe(61_000);
    expect(roundSalary(123_456)).toBe(123_000);
    expect(roundSalary(2_944_000)).toBe(2_940_000);
  });
});
