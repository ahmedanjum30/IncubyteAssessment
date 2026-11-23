'use client';

import { DEPARTMENTS, countryByCode, type CountryCode, type Department } from '@acme/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { api, keys } from '@/lib/api';
import { count, usd } from '@/lib/format';
import { BelowBandTable } from './BelowBandTable';
import { BoxPlot, type BoxPlotRow } from './BoxPlot';
import { CountUp } from './CountUp';
import { Plate } from './Plate';
import { Seal } from './Seal';
import { Tokens } from './Tokens';
import styles from './OverviewView.module.css';

type DeptToken = Department | 'All';
const TOKENS = [
  { value: 'All' as const, label: 'All' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
];

const formatCount = (n: number) => count(Math.round(n));
const formatUsd = (n: number) => usd(Math.round(n / 100) * 100);
const formatRatio = (n: number) => `${n.toFixed(1)}×`;

export function OverviewView() {
  const [dept, setDept] = useState<DeptToken>('Engineering');
  const [country, setCountry] = useState<CountryCode | null>(null);
  const [showBand, setShowBand] = useState(false);
  const department = dept === 'All' ? undefined : dept;
  const filter = { department };

  const summary = useQuery({
    queryKey: keys.summary(filter),
    queryFn: ({ signal }) => api.summary(filter, signal),
    placeholderData: keepPreviousData,
  });
  const distribution = useQuery({
    queryKey: keys.distribution(filter),
    queryFn: ({ signal }) => api.distribution(filter, signal),
    placeholderData: keepPreviousData,
  });
  const belowFilter = { department, country: country ?? undefined, limit: 8 };
  const below = useQuery({
    queryKey: keys.belowBand(belowFilter),
    queryFn: ({ signal }) => api.belowBand(belowFilter, signal),
    placeholderData: keepPreviousData,
  });

  const rows: BoxPlotRow[] = useMemo(
    () =>
      (distribution.data ?? []).map((d) => ({
        key: d.countryCode,
        label: d.countryName,
        p10: d.p10,
        p25: d.p25,
        median: d.median,
        p75: d.p75,
        p90: d.p90,
        bandMin: d.bandMinMedian,
        attention: d.bandMinMedian !== null && d.median < d.bandMinMedian,
        detail: `${d.countryName} · ${count(d.headcount)} people · ${count(d.belowBand)} below band`,
      })),
    [distribution.data],
  );

  const spread = useMemo(() => {
    const d = distribution.data;
    if (!d?.length) return null;
    return Math.max(...d.map((r) => r.p90)) / Math.max(1, Math.min(...d.map((r) => r.p10)));
  }, [distribution.data]);

  const label = dept === 'All' ? 'Pay' : `${dept} pay`;
  const countryName = country ? countryByCode(country)?.name : null;
  const employeesHref = `/employees?band=below${department ? `&department=${department}` : ''}${country ? `&country=${country}` : ''}&sort=gap`;

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1 key={dept} className="page-title">
          {label}, across twelve countries
        </h1>
        <p className="muted">
          Annual base salary converted to USD at fixed 1 Nov 2026 rates. Each box spans the middle
          half of employees, the whiskers run from the 10th to the 90th percentile, and the bar
          marks the median.
        </p>
      </div>
      <div className={styles.filters}>
        <Tokens
          label="Department"
          options={TOKENS}
          value={dept}
          onChange={(d) => {
            setDept(d);
            setCountry(null);
          }}
        />
      </div>

      <section className={styles.stats} aria-label="Summary" aria-busy={summary.isFetching}>
        <div className={styles.stat}>
          <span className="mono muted">Employees</span>
          <b>
            <CountUp value={summary.data?.headcount} format={formatCount} />
          </b>
        </div>
        <div className={styles.stat}>
          <span className="mono muted">Median base, USD</span>
          <b>
            <CountUp value={summary.data?.medianUsd} format={formatUsd} />
          </b>
        </div>
        <div className={styles.stat}>
          <span className="mono muted">Spread, P90 / P10</span>
          <b>
            <CountUp value={spread} format={formatRatio} />
          </b>
        </div>
        <div className={`${styles.stat} ${styles.attention}`}>
          <span className="mono muted">Below band minimum</span>
          <b>
            <CountUp value={summary.data?.belowBand} format={formatCount} />
          </b>
          <Seal className={styles.seal} />
        </div>
      </section>

      <Plate
        id="distribution"
        title="Where the pay sits"
        meta="Plate 1 · by country"
        className={styles.plotPlate}
      >
        {distribution.isError ? (
          <p className="error-text">Could not load the distribution. Refresh to try again.</p>
        ) : (
          <BoxPlot
            rows={rows}
            selected={country}
            onSelect={(key) => setCountry(key as CountryCode | null)}
            showBand={showBand}
          />
        )}
        <div className={`mono muted ${styles.legend}`}>
          <span>
            <i className={styles.key} /> Within band
          </span>
          <span>
            <i className={`${styles.key} ${styles.keyAttention}`} /> Median below band
          </span>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showBand}
              onChange={(e) => setShowBand(e.target.checked)}
            />{' '}
            Show band
          </label>
        </div>
      </Plate>

      <Plate
        id="below"
        title="Needs a decision"
        meta={
          countryName ? (
            <button type="button" className="link mono" onClick={() => setCountry(null)}>
              {countryName} · clear
            </button>
          ) : (
            'Plate 2 · largest gap first'
          )
        }
        className={styles.tablePlate}
      >
        <BelowBandTable
          rows={below.data ?? []}
          empty={
            below.isLoading
              ? 'Loading…'
              : `No one is below band${countryName ? ` in ${countryName}` : ''}.`
          }
        />
        <div className={styles.foot}>
          <span className="mono muted">
            {summary.data ? `${count(summary.data.belowBand)} below band in total` : ''}
          </span>
          <Link href={employeesHref} className="link">
            Open all in Employees
          </Link>
        </div>
      </Plate>

      <footer className={`mono muted ${styles.colophon}`}>
        <span>Seeded demo data · 10,000 employees · 12 countries</span>
        <span>FX fixed at 1 Nov 2026</span>
      </footer>
    </main>
  );
}
