'use client';

import {
  COUNTRIES,
  DEPARTMENTS,
  type CountryCode,
  type Department,
  type JobTitleStats,
} from '@acme/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { api, keys } from '@/lib/api';
import { count, usd, usdCompact } from '@/lib/format';
import { niceMax, percentOf } from '@/lib/scale';
import { CountUp } from './CountUp';
import { Plate } from './Plate';
import tableStyles from './Table.module.css';
import styles from './InsightsView.module.css';

type SortKey = 'jobTitle' | 'headcount' | 'medianUsd' | 'averageUsd';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'medianUsd', label: 'Median' },
  { key: 'averageUsd', label: 'Average' },
  { key: 'headcount', label: 'Headcount' },
  { key: 'jobTitle', label: 'Title' },
];

const formatUsd = (n: number) => usd(Math.round(n / 100) * 100);
const formatCount = (n: number) => count(Math.round(n));

function sortRows(rows: JobTitleStats[], key: SortKey): JobTitleStats[] {
  return [...rows].sort((a, b) =>
    key === 'jobTitle' ? a.jobTitle.localeCompare(b.jobTitle) : b[key] - a[key],
  );
}

export function InsightsView() {
  const [country, setCountry] = useState<CountryCode | undefined>();
  const [department, setDepartment] = useState<Department | undefined>();
  const [sort, setSort] = useState<SortKey>('medianUsd');
  const filter = { country, department };

  const summary = useQuery({
    queryKey: keys.summary(filter),
    queryFn: ({ signal }) => api.summary(filter, signal),
    placeholderData: keepPreviousData,
  });
  const titles = useQuery({
    queryKey: keys.jobTitles(filter),
    queryFn: ({ signal }) => api.jobTitles(filter, signal),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => sortRows(titles.data ?? [], sort), [titles.data, sort]);
  const rowsKey = useMemo(() => rows.map((r) => r.headcount).join('.'), [rows]);
  const max = niceMax(Math.max(1, ...rows.map((r) => r.maxUsd)));
  const scope = [department, country ? COUNTRIES.find((c) => c.code === country)?.name : null]
    .filter(Boolean)
    .join(' in ');

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1 className="page-title">What we pay for each role</h1>
        <p className="muted">
          Minimum, median and maximum annual base salary per job title, in USD. Use the filters to
          compare a role across countries or within one market.
        </p>
      </div>

      <div className={styles.filters}>
        <label className="field">
          <span>Country</span>
          <select
            className="input"
            value={country ?? ''}
            onChange={(e) => setCountry((e.target.value || undefined) as CountryCode | undefined)}
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
            value={department ?? ''}
            onChange={(e) => setDepartment((e.target.value || undefined) as Department | undefined)}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Sort by</span>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className={styles.stats} aria-label="Summary">
        <div>
          <span className="mono muted">Employees</span>
          <b>
            <CountUp value={summary.data?.headcount} format={formatCount} />
          </b>
        </div>
        <div>
          <span className="mono muted">Median base, USD</span>
          <b>
            <CountUp value={summary.data?.medianUsd} format={formatUsd} />
          </b>
        </div>
        <div>
          <span className="mono muted">Average base, USD</span>
          <b>
            <CountUp value={summary.data?.averageUsd} format={formatUsd} />
          </b>
        </div>
        <div className={styles.attention}>
          <span className="mono muted">Below band minimum</span>
          <b>
            <CountUp value={summary.data?.belowBand} format={formatCount} />
          </b>
        </div>
      </section>

      <Plate
        id="titles"
        title={scope ? `Job titles, ${scope}` : 'Job titles'}
        meta={`${rows.length} roles`}
      >
        <div className={tableStyles.wrap}>
          <table className={`${tableStyles.table} ${titles.isPlaceholderData ? styles.stale : ''}`}>
            <thead>
              <tr>
                <th scope="col">Job title</th>
                <th scope="col" className={tableStyles.n}>
                  People
                </th>
                <th scope="col" className={`${styles.rangeCol} ${tableStyles.hideSm}`}>
                  <span className="sr-only">Salary range chart</span>
                  <span className={styles.axis} aria-hidden="true">
                    <span>$0</span>
                    <span>{usdCompact(max / 2)}</span>
                    <span>{usdCompact(max)}</span>
                  </span>
                </th>
                <th scope="col" className={tableStyles.n}>
                  Median
                </th>
                <th scope="col" className={`${tableStyles.n} ${tableStyles.hideSm}`}>
                  Range
                </th>
              </tr>
            </thead>
            <tbody>
              {titles.isLoading ? (
                <tr>
                  <td colSpan={5} className={tableStyles.empty}>
                    Loading…
                  </td>
                </tr>
              ) : null}
              {titles.isError ? (
                <tr>
                  <td colSpan={5} className={tableStyles.empty}>
                    Could not load job titles.
                  </td>
                </tr>
              ) : null}
              {!titles.isLoading && rows.length === 0 && !titles.isError ? (
                <tr>
                  <td colSpan={5} className={tableStyles.empty}>
                    No employees for this filter.
                  </td>
                </tr>
              ) : null}
              {rows.map((r, i) => (
                <tr
                  key={`${rowsKey}-${r.department}-${r.jobTitle}`}
                  className="row-enter"
                  style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }}
                >
                  <td>
                    <Link
                      className={tableStyles.rowLink}
                      href={`/employees?jobTitle=${encodeURIComponent(r.jobTitle)}${country ? `&country=${country}` : ''}&sort=salaryUsd&order=desc`}
                    >
                      {r.jobTitle}
                    </Link>
                    <small>{r.department}</small>
                  </td>
                  <td className={tableStyles.n}>{count(r.headcount)}</td>
                  <td className={`${styles.rangeCol} ${tableStyles.hideSm}`} aria-hidden="true">
                    <span className={styles.range}>
                      <span
                        className={styles.span}
                        style={{
                          left: `${percentOf(r.minUsd, max)}%`,
                          width: `${percentOf(r.maxUsd, max) - percentOf(r.minUsd, max)}%`,
                          animationDelay: `${Math.min(i, 20) * 25}ms`,
                        }}
                      />
                      <span
                        className={styles.median}
                        style={{ left: `${percentOf(r.medianUsd, max)}%` }}
                      />
                    </span>
                  </td>
                  <td className={tableStyles.n}>{usd(r.medianUsd)}</td>
                  <td className={`${tableStyles.n} ${tableStyles.hideSm} muted`}>
                    {usdCompact(r.minUsd)} – {usdCompact(r.maxUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Plate>
    </main>
  );
}
