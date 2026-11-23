'use client';

import {
  COUNTRIES,
  DEPARTMENTS,
  JOB_TITLES,
  type EmployeeListQuery,
  type SortField,
} from '@acme/shared';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react';
import { api, keys } from '@/lib/api';
import { count, money, signedUsd, usd } from '@/lib/format';
import { parseListParams, toListParams } from '@/lib/listParams';
import { Dialog } from './Dialog';
import { EmployeeForm } from './EmployeeForm';
import { Plate } from './Plate';
import tableStyles from './Table.module.css';
import styles from './EmployeesView.module.css';

const COLUMNS: { field: SortField | null; label: string; numeric?: boolean; hideSm?: boolean }[] = [
  { field: 'name', label: 'Employee' },
  { field: null, label: 'Department', hideSm: true },
  { field: 'country', label: 'Country', hideSm: true },
  { field: 'level', label: 'Level', hideSm: true },
  { field: 'salary', label: 'Base salary', numeric: true },
  { field: 'salaryUsd', label: 'USD', numeric: true, hideSm: true },
  { field: 'gap', label: 'Band', numeric: true },
];

export function EmployeesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const query = useMemo(() => parseListParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [search, setSearch] = useState(query.q ?? '');
  const [adding, setAdding] = useState(false);

  const update = (patch: Partial<EmployeeListQuery>) => {
    const next = { ...query, ...patch, page: patch.page ?? 1 };
    const qs = toListParams(next);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const applySearch = useEffectEvent((term: string | undefined) => update({ q: term }));

  useEffect(() => {
    const term = search.trim() || undefined;
    if (term === query.q) return;
    const id = setTimeout(() => applySearch(term), 250);
    return () => clearTimeout(id);
  }, [search, query.q]);

  const list = useQuery({
    queryKey: keys.employeeList(query),
    queryFn: ({ signal }) => api.employees(query, signal),
    placeholderData: keepPreviousData,
  });

  const pages = list.data ? Math.max(1, Math.ceil(list.data.total / query.pageSize)) : 1;

  useEffect(() => {
    if (!list.data || query.page >= pages) return;
    const next = { ...query, page: query.page + 1 };
    void queryClient.prefetchQuery({
      queryKey: keys.employeeList(next),
      queryFn: ({ signal }) => api.employees(next, signal),
    });
  }, [list.data, query, pages, queryClient]);

  const sortBy = (field: SortField) =>
    update({
      sort: field,
      order: query.sort === field && query.order === 'asc' ? 'desc' : 'asc',
    });

  const titles = query.department
    ? JOB_TITLES[query.department].map((j) => j.title)
    : Object.values(JOB_TITLES).flatMap((t) => t.map((j) => j.title));

  const first = list.data ? (query.page - 1) * query.pageSize + 1 : 0;
  const last = list.data ? Math.min(list.data.total, query.page * query.pageSize) : 0;

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1>Employees</h1>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          Add employee
        </button>
      </div>

      <search className={styles.filters}>
        <label className={`field ${styles.search}`}>
          <span>Search</span>
          <input
            className="input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email or employee code"
          />
        </label>
        <label className="field">
          <span>Country</span>
          <select
            className="input"
            value={query.country ?? ''}
            onChange={(e) => update({ country: (e.target.value || undefined) as EmployeeListQuery['country'] })}
          >
            <option value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Department</span>
          <select
            className="input"
            value={query.department ?? ''}
            onChange={(e) =>
              update({
                department: (e.target.value || undefined) as EmployeeListQuery['department'],
                jobTitle: undefined,
              })
            }
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Job title</span>
          <select
            className="input"
            value={query.jobTitle ?? ''}
            onChange={(e) => update({ jobTitle: e.target.value || undefined })}
          >
            <option value="">All job titles</option>
            {titles.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Band</span>
          <select
            className="input"
            value={query.band ?? ''}
            onChange={(e) => update({ band: (e.target.value || undefined) as EmployeeListQuery['band'] })}
          >
            <option value="">Any</option>
            <option value="below">Below band</option>
            <option value="within">Within band</option>
            <option value="above">Above band</option>
          </select>
        </label>
      </search>

      <Plate
        id="employees"
        title={list.data ? `${count(list.data.total)} employees` : 'Employees'}
        meta={list.data && list.data.total > 0 ? `${count(first)}–${count(last)}` : undefined}
      >
        <div className={tableStyles.wrap} aria-busy={list.isFetching}>
          <table className={`${tableStyles.table} ${list.isPlaceholderData ? styles.stale : ''}`}>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.label}
                    scope="col"
                    className={`${c.numeric ? tableStyles.n : ''} ${c.hideSm ? tableStyles.hideSm : ''}`}
                    aria-sort={
                      c.field && query.sort === c.field
                        ? query.order === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {c.field ? (
                      <button
                        type="button"
                        className={tableStyles.sortBtn}
                        data-active={query.sort === c.field || undefined}
                        onClick={() => sortBy(c.field!)}
                      >
                        {c.label}
                        <span aria-hidden="true">
                          {query.sort === c.field ? (query.order === 'asc' ? '↑' : '↓') : ''}
                        </span>
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.isLoading
                ? Array.from({ length: 10 }, (_, i) => (
                    <tr key={i} className={tableStyles.skeleton}>
                      {COLUMNS.map((c) => (
                        <td key={c.label} className={c.hideSm ? tableStyles.hideSm : ''}>
                          ·
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
              {list.isError ? (
                <tr>
                  <td colSpan={COLUMNS.length} className={tableStyles.empty}>
                    Could not load employees.{' '}
                    <button type="button" className="link" onClick={() => void list.refetch()}>
                      Try again
                    </button>
                  </td>
                </tr>
              ) : null}
              {list.data?.items.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className={tableStyles.empty}>
                    No employees match these filters.
                  </td>
                </tr>
              ) : null}
              {list.data?.items.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/employees/${e.id}`} className={tableStyles.rowLink}>
                      {e.fullName}
                    </Link>
                    <small>
                      {e.jobTitle} · {e.employeeCode}
                    </small>
                  </td>
                  <td className={tableStyles.hideSm}>{e.department}</td>
                  <td className={tableStyles.hideSm}>{e.countryName}</td>
                  <td className={tableStyles.hideSm}>L{e.level}</td>
                  <td className={tableStyles.n}>{money(e.salary, e.currency)}</td>
                  <td className={`${tableStyles.n} ${tableStyles.hideSm}`}>{usd(e.salaryUsd)}</td>
                  <td className={tableStyles.n}>
                    {e.bandStatus === 'below' ? (
                      <>
                        <span className="stamp mono">Below</span>
                        <small className={tableStyles.gap}>{signedUsd(e.gapUsd)}</small>
                      </>
                    ) : (
                      <span className="mono muted">{e.bandStatus === 'above' ? 'Above' : 'In band'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav className={styles.pager} aria-label="Pagination">
          <label className={`mono muted ${styles.pageSize}`}>
            Rows
            <select
              className="input"
              value={query.pageSize}
              onChange={(e) => update({ pageSize: Number(e.target.value) })}
            >
              {[25, 50, 100].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <span className="mono muted">
            Page {query.page} of {count(pages)}
          </span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={query.page <= 1}
              onClick={() => update({ page: query.page - 1 })}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={query.page >= pages}
              onClick={() => update({ page: query.page + 1 })}
            >
              Next
            </button>
          </div>
        </nav>
      </Plate>

      <Dialog
        open={adding}
        onOpenChange={setAdding}
        title="Add employee"
        description="Salary is entered in the local currency of the employee's country."
        wide
      >
        <EmployeeForm
          onCancel={() => setAdding(false)}
          onDone={(saved) => {
            setAdding(false);
            router.push(`/employees/${saved.id}`);
          }}
        />
      </Dialog>
    </main>
  );
}
