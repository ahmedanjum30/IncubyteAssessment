import { COUNTRIES, type CountryCode, type Department, type Level } from './reference.js';

export type BandStatus = 'below' | 'within' | 'above';

export interface Band {
  min: number;
  max: number;
}

const L1_MIDPOINT_USD: Record<CountryCode, number> = {
  US: 70_000,
  AU: 55_000,
  CA: 52_000,
  GB: 50_000,
  DE: 48_000,
  NL: 47_000,
  SG: 42_000,
  PL: 22_000,
  BR: 13_000,
  IN: 12_000,
  MX: 12_000,
  PH: 8_000,
};

const LEVEL_FACTOR: Record<Level, number> = { 1: 1, 2: 1.25, 3: 1.55, 4: 1.9, 5: 2.35, 6: 2.9 };

const DEPARTMENT_FACTOR: Record<Department, number> = {
  Engineering: 1,
  Product: 1.05,
  Design: 0.95,
  Sales: 0.92,
  Support: 0.65,
  Operations: 0.7,
  Finance: 0.88,
  People: 0.8,
};

export const BAND_SPREAD = { min: 0.85, max: 1.2 } as const;

export function toUsd(amount: number, usdPerUnit: number): number {
  return Math.round(amount * usdPerUnit * 100) / 100;
}

export function roundSalary(amount: number): number {
  const step = amount >= 1_000_000 ? 10_000 : amount >= 100_000 ? 1_000 : 500;
  return Math.round(amount / step) * step;
}

export function bandMidpoint(country: CountryCode, department: Department, level: Level): number {
  const fx = COUNTRIES.find((c) => c.code === country)!.usdPerUnit;
  return (L1_MIDPOINT_USD[country] * LEVEL_FACTOR[level] * DEPARTMENT_FACTOR[department]) / fx;
}

export function bandFor(country: CountryCode, department: Department, level: Level): Band {
  const mid = bandMidpoint(country, department, level);
  return { min: roundSalary(mid * BAND_SPREAD.min), max: roundSalary(mid * BAND_SPREAD.max) };
}

export function bandStatus(salary: number, band: Band): BandStatus {
  if (salary < band.min) return 'below';
  if (salary > band.max) return 'above';
  return 'within';
}

export function gapToBand(salary: number, band: Band): number {
  if (salary < band.min) return salary - band.min;
  if (salary > band.max) return salary - band.max;
  return 0;
}
