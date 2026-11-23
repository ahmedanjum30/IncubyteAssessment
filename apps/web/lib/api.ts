import type {
  CountryDistribution,
  Employee,
  EmployeeDetail,
  EmployeeInput,
  EmployeeListQuery,
  EmployeeUpdate,
  InsightFilter,
  JobTitleStats,
  Page,
  Summary,
} from '@acme/shared';

export interface FieldIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly issues: FieldIssue[] = [],
  ) {
    super(message);
  }
}

export function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === 'string' ? body.message : 'Something went wrong';
    throw new ApiError(res.status, message, body.issues ?? []);
  }
  return body as T;
}

export const api = {
  employees: (q: Partial<EmployeeListQuery>, signal?: AbortSignal) =>
    request<Page<Employee>>(`/employees${toQueryString(q)}`, { signal }),
  employee: (id: number, signal?: AbortSignal) =>
    request<EmployeeDetail>(`/employees/${id}`, { signal }),
  createEmployee: (input: EmployeeInput) =>
    request<EmployeeDetail>('/employees', { method: 'POST', body: JSON.stringify(input) }),
  updateEmployee: (id: number, update: EmployeeUpdate) =>
    request<EmployeeDetail>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(update) }),
  deleteEmployee: (id: number) => request<void>(`/employees/${id}`, { method: 'DELETE' }),
  summary: (f: InsightFilter, signal?: AbortSignal) =>
    request<Summary>(`/insights/summary${toQueryString(f)}`, { signal }),
  distribution: (f: InsightFilter, signal?: AbortSignal) =>
    request<CountryDistribution[]>(`/insights/distribution${toQueryString(f)}`, { signal }),
  jobTitles: (f: InsightFilter, signal?: AbortSignal) =>
    request<JobTitleStats[]>(`/insights/job-titles${toQueryString(f)}`, { signal }),
  belowBand: (f: InsightFilter & { limit?: number }, signal?: AbortSignal) =>
    request<Employee[]>(`/insights/below-band${toQueryString(f)}`, { signal }),
};

export const keys = {
  employees: ['employees'] as const,
  employeeList: (q: object) => ['employees', 'list', q] as const,
  employee: (id: number) => ['employees', 'detail', id] as const,
  insights: ['insights'] as const,
  summary: (f: object) => ['insights', 'summary', f] as const,
  distribution: (f: object) => ['insights', 'distribution', f] as const,
  jobTitles: (f: object) => ['insights', 'job-titles', f] as const,
  belowBand: (f: object) => ['insights', 'below-band', f] as const,
};
