import { employeeListQuerySchema, type EmployeeListQuery } from '@acme/shared';

export const DEFAULT_QUERY: EmployeeListQuery = employeeListQuerySchema.parse({});

export function parseListParams(params: URLSearchParams): EmployeeListQuery {
  const raw = Object.fromEntries(params.entries());
  const parsed = employeeListQuerySchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const valid: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (employeeListQuerySchema.safeParse({ [key]: value }).success) valid[key] = value;
  }
  return employeeListQuerySchema.parse(valid);
}

export function toListParams(query: EmployeeListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    if (value === DEFAULT_QUERY[key as keyof EmployeeListQuery]) continue;
    params.set(key, String(value));
  }
  return params.toString();
}
