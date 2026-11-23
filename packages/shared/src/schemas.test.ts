import { describe, expect, it } from 'vitest';
import { employeeInputSchema, employeeListQuerySchema } from './schemas.js';

const valid = {
  fullName: 'Lena Hoffmann',
  email: 'Lena.Hoffmann@Acme.example',
  jobTitle: 'Data Engineer',
  department: 'Engineering',
  level: 3,
  countryCode: 'DE',
  salary: 61000,
  hiredOn: '2022-04-01',
};

describe('employee input', () => {
  it('accepts a valid employee and normalises the email', () => {
    const parsed = employeeInputSchema.parse(valid);
    expect(parsed.email).toBe('lena.hoffmann@acme.example');
  });

  it('rejects a zero or negative salary', () => {
    expect(employeeInputSchema.safeParse({ ...valid, salary: 0 }).success).toBe(false);
    expect(employeeInputSchema.safeParse({ ...valid, salary: -10 }).success).toBe(false);
  });

  it('rejects unknown countries and levels outside 1 to 6', () => {
    expect(employeeInputSchema.safeParse({ ...valid, countryCode: 'FR' }).success).toBe(false);
    expect(employeeInputSchema.safeParse({ ...valid, level: 7 }).success).toBe(false);
  });

  it('rejects a hire date in the future', () => {
    expect(employeeInputSchema.safeParse({ ...valid, hiredOn: '2999-01-01' }).success).toBe(false);
  });
});

describe('employee list query', () => {
  it('applies defaults and coerces query-string numbers', () => {
    expect(employeeListQuerySchema.parse({ page: '3' })).toMatchObject({
      sort: 'name',
      order: 'asc',
      page: 3,
      pageSize: 25,
    });
  });

  it('caps the page size so one request cannot pull the whole table', () => {
    expect(employeeListQuerySchema.safeParse({ pageSize: '10000' }).success).toBe(false);
  });

  it('treats an empty search as no search', () => {
    expect(employeeListQuerySchema.parse({ q: '  ' }).q).toBeUndefined();
  });
});
