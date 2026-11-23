import type { BandStatus } from './pay.js';
import type { CountryCode, Department } from './reference.js';

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: Department;
  level: number;
  countryCode: CountryCode;
  countryName: string;
  currency: string;
  salary: number;
  salaryUsd: number;
  hiredOn: string;
  bandMin: number | null;
  bandMax: number | null;
  bandStatus: BandStatus | null;
  gapUsd: number;
}

export interface SalaryChange {
  id: number;
  previousSalary: number;
  previousCurrency: string;
  newSalary: number;
  currency: string;
  reason: string | null;
  changedAt: string;
}

export interface EmployeeDetail extends Employee {
  history: SalaryChange[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Summary {
  headcount: number;
  medianUsd: number | null;
  averageUsd: number | null;
  belowBand: number;
  countries: number;
}

export interface CountryDistribution {
  countryCode: CountryCode;
  countryName: string;
  headcount: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  bandMinMedian: number | null;
  belowBand: number;
}

export interface JobTitleStats {
  jobTitle: string;
  department: Department;
  headcount: number;
  minUsd: number;
  medianUsd: number;
  averageUsd: number;
  maxUsd: number;
}

export interface Meta {
  fxAsOf: string;
  countries: { code: CountryCode; name: string; currency: string; usdPerUnit: number }[];
  departments: readonly Department[];
  jobTitles: Record<Department, string[]>;
  levels: readonly number[];
}
