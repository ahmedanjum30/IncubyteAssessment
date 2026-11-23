import { describe, expect, it } from 'vitest';
import { niceMax, percentOf, ticks } from './scale';

describe('chart scale', () => {
  it('rounds the axis maximum up to a readable number', () => {
    expect(niceMax(182_500)).toBe(200_000);
    expect(niceMax(131_000)).toBe(200_000);
    expect(niceMax(24_000)).toBe(25_000);
  });

  it('places values as clamped percentages of the axis', () => {
    expect(percentOf(50, 200)).toBe(25);
    expect(percentOf(500, 200)).toBe(100);
    expect(ticks(200_000)).toEqual([0, 100_000, 200_000]);
  });
});
