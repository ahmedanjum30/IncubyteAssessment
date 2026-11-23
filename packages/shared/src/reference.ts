export const FX_AS_OF = '2026-11-01';

export const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', usdPerUnit: 1 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', usdPerUnit: 1.262 },
  { code: 'DE', name: 'Germany', currency: 'EUR', usdPerUnit: 1.085 },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', usdPerUnit: 1.085 },
  { code: 'CA', name: 'Canada', currency: 'CAD', usdPerUnit: 0.735 },
  { code: 'AU', name: 'Australia', currency: 'AUD', usdPerUnit: 0.66 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', usdPerUnit: 0.745 },
  { code: 'PL', name: 'Poland', currency: 'PLN', usdPerUnit: 0.2515 },
  { code: 'IN', name: 'India', currency: 'INR', usdPerUnit: 0.012 },
  { code: 'BR', name: 'Brazil', currency: 'BRL', usdPerUnit: 0.2 },
  { code: 'MX', name: 'Mexico', currency: 'MXN', usdPerUnit: 0.0582 },
  { code: 'PH', name: 'Philippines', currency: 'PHP', usdPerUnit: 0.0175 },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['code'];
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]];

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Support',
  'Operations',
  'Finance',
  'People',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type Level = (typeof LEVELS)[number];

export const JOB_TITLES: Record<
  Department,
  ReadonlyArray<{ title: string; levels: readonly Level[] }>
> = {
  Engineering: [
    { title: 'Software Engineer', levels: [1, 2, 3] },
    { title: 'Senior Software Engineer', levels: [4] },
    { title: 'Staff Engineer', levels: [5] },
    { title: 'Engineering Manager', levels: [5, 6] },
    { title: 'QA Engineer', levels: [1, 2, 3, 4] },
    { title: 'DevOps Engineer', levels: [2, 3, 4, 5] },
    { title: 'Data Engineer', levels: [2, 3, 4, 5] },
  ],
  Product: [
    { title: 'Product Analyst', levels: [1, 2, 3] },
    { title: 'Product Manager', levels: [3, 4] },
    { title: 'Senior Product Manager', levels: [5] },
    { title: 'Director of Product', levels: [6] },
  ],
  Design: [
    { title: 'Product Designer', levels: [2, 3, 4] },
    { title: 'UX Researcher', levels: [2, 3, 4] },
    { title: 'Design Lead', levels: [5, 6] },
  ],
  Sales: [
    { title: 'Sales Development Rep', levels: [1, 2] },
    { title: 'Account Executive', levels: [2, 3, 4] },
    { title: 'Sales Manager', levels: [5] },
    { title: 'Sales Director', levels: [6] },
  ],
  Support: [
    { title: 'Support Specialist', levels: [1, 2] },
    { title: 'Support Engineer', levels: [2, 3, 4] },
    { title: 'Customer Success Lead', levels: [4, 5] },
  ],
  Operations: [
    { title: 'Facilities Coordinator', levels: [1, 2] },
    { title: 'Operations Analyst', levels: [1, 2, 3] },
    { title: 'Operations Manager', levels: [4, 5] },
  ],
  Finance: [
    { title: 'Payroll Specialist', levels: [2, 3] },
    { title: 'Financial Analyst', levels: [2, 3, 4] },
    { title: 'Finance Manager', levels: [5, 6] },
  ],
  People: [
    { title: 'Recruiter', levels: [2, 3] },
    { title: 'HR Generalist', levels: [2, 3, 4] },
    { title: 'People Partner', levels: [4, 5] },
  ],
};

export const ALL_JOB_TITLES = Object.values(JOB_TITLES).flatMap((t) => t.map((j) => j.title));

export function countryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code);
}
