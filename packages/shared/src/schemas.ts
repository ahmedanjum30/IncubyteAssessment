import { z } from 'zod';
import { COUNTRY_CODES, DEPARTMENTS, LEVELS } from './reference.js';

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const employeeInputSchema = z.object({
  fullName: trimmed(2, 120, 'Full name'),
  email: z.email('Enter a valid email address').trim().toLowerCase().max(160),
  jobTitle: trimmed(2, 80, 'Job title'),
  department: z.enum(DEPARTMENTS, 'Choose a department'),
  level: z.coerce
    .number()
    .int()
    .refine((l) => (LEVELS as readonly number[]).includes(l), 'Level must be between 1 and 6'),
  countryCode: z.enum(COUNTRY_CODES, 'Choose a country'),
  salary: z.coerce
    .number('Enter the salary as a number')
    .positive('Salary must be greater than zero')
    .max(1_000_000_000)
    .transform((n) => Math.round(n * 100) / 100),
  hiredOn: z.iso.date('Enter a valid date').refine((d) => d <= new Date().toISOString().slice(0, 10), {
    message: 'Hire date cannot be in the future',
  }),
});

export const employeeUpdateSchema = employeeInputSchema.partial().extend({
  salaryChangeReason: trimmed(2, 200, 'Reason').optional(),
});

export const SORT_FIELDS = ['name', 'salary', 'salaryUsd', 'level', 'hiredOn', 'country', 'gap'] as const;

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((v) => v || undefined)
  .optional();

export const employeeListQuerySchema = z.object({
  q: optionalText,
  country: z.enum(COUNTRY_CODES).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  jobTitle: optionalText,
  band: z.enum(['below', 'within', 'above']).optional(),
  sort: z.enum(SORT_FIELDS).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(25),
});

export const insightFilterSchema = z.object({
  country: z.enum(COUNTRY_CODES).optional(),
  department: z.enum(DEPARTMENTS).optional(),
});

export const belowBandQuerySchema = insightFilterSchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
export type InsightFilter = z.infer<typeof insightFilterSchema>;
export type BelowBandQuery = z.infer<typeof belowBandQuerySchema>;
export type SortField = (typeof SORT_FIELDS)[number];
