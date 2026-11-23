import { bandFor, bandStatus } from '@acme/shared';
import { describe, expect, it } from 'vitest';
import { generateEmployees } from './generate.js';

describe('seed generator', () => {
  const employees = generateEmployees(10_000);

  it('creates exactly the requested number of employees', () => {
    expect(employees).toHaveLength(10_000);
  });

  it('is deterministic for the same seed', () => {
    expect(generateEmployees(50)).toEqual(generateEmployees(50));
    expect(generateEmployees(50, 1)).not.toEqual(generateEmployees(50, 2));
  });

  it('gives every employee a unique code and email', () => {
    expect(new Set(employees.map((e) => e.employeeCode)).size).toBe(10_000);
    expect(new Set(employees.map((e) => e.email)).size).toBe(10_000);
  });

  it('spreads people across all twelve countries with positive salaries', () => {
    expect(new Set(employees.map((e) => e.countryCode)).size).toBe(12);
    expect(employees.every((e) => e.salary > 0)).toBe(true);
  });

  it('places most employees within band so below-band is a real but minority signal', () => {
    const below = employees.filter(
      (e) => bandStatus(e.salary, bandFor(e.countryCode, e.department, e.level)) === 'below',
    ).length;
    expect(below / employees.length).toBeGreaterThan(0.05);
    expect(below / employees.length).toBeLessThan(0.3);
  });
});
