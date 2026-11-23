'use client';

import { useEffect, useState } from 'react';
import { usdCompact } from '@/lib/format';
import { niceMax, percentOf, ticks } from '@/lib/scale';
import styles from './BoxPlot.module.css';

export interface BoxPlotRow {
  key: string;
  label: string;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  bandMin: number | null;
  attention: boolean;
  meta?: string;
}

interface BoxPlotProps {
  rows: BoxPlotRow[];
  selected?: string | null;
  onSelect?: (key: string | null) => void;
  showBand?: boolean;
}

export function BoxPlotSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <ul className={styles.rows} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className={`${styles.row} ${styles.skeleton}`}>
          <span />
          <span />
          <span />
        </li>
      ))}
    </ul>
  );
}

export function BoxPlot({ rows, selected, onSelect, showBand = false }: BoxPlotProps) {
  const [printed, setPrinted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPrinted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = niceMax(Math.max(...rows.map((r) => r.p90), 1));
  const pos = (v: number) => percentOf(v, max);

  return (
    <div className={styles.plot}>
      <ul className={styles.rows}>
        {rows.map((r, i) => {
          const at = (from: number, to: number) =>
            printed
              ? { left: `${pos(from)}%`, width: `${Math.max(0, pos(to) - pos(from))}%` }
              : { left: `${pos(r.median)}%`, width: '0%' };
          const delay = { transitionDelay: `${printed ? i * 40 : 0}ms` };
          const isSelected = selected === r.key;
          return (
            <li key={r.key} className={styles.item}>
              <button
                type="button"
                className={styles.row}
                data-attention={r.attention || undefined}
                aria-pressed={onSelect ? isSelected : undefined}
                onClick={onSelect ? () => onSelect(isSelected ? null : r.key) : undefined}
                aria-label={`${r.label}: median ${usdCompact(r.median)}, middle half ${usdCompact(r.p25)} to ${usdCompact(r.p75)}${r.attention ? ', median below band' : ''}`}
              >
                <span className={styles.label}>{r.label}</span>
                <span className={styles.track} aria-hidden="true">
                  {showBand && r.bandMin !== null ? (
                    <span
                      className={styles.band}
                      style={{ ...at(r.bandMin, r.bandMin * 1.41), ...delay }}
                    />
                  ) : null}
                  <span className={styles.whisker} style={{ ...at(r.p10, r.p90), ...delay }} />
                  <span className={styles.box} style={{ ...at(r.p25, r.p75), ...delay }} />
                  <span
                    className={styles.median}
                    style={{
                      left: `${pos(r.median)}%`,
                      transform: `scaleY(${printed ? 1 : 0})`,
                      ...delay,
                    }}
                  />
                </span>
                <span className={`num ${styles.value}`}>{usdCompact(r.median)}</span>
              </button>
              <div className={styles.tip} role="presentation">
                <strong className={styles.tipTitle}>{r.label}</strong>
                {r.meta ? <span className="mono">{r.meta}</span> : null}
                <dl>
                  <dt>P90</dt>
                  <dd>{usdCompact(r.p90)}</dd>
                  <dt>P75</dt>
                  <dd>{usdCompact(r.p75)}</dd>
                  <dt>Median</dt>
                  <dd>{usdCompact(r.median)}</dd>
                  <dt>P25</dt>
                  <dd>{usdCompact(r.p25)}</dd>
                  <dt>P10</dt>
                  <dd>{usdCompact(r.p10)}</dd>
                  {r.bandMin !== null ? (
                    <>
                      <dt>Band min</dt>
                      <dd>{usdCompact(r.bandMin)}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
      <div className={`mono muted ${styles.axis}`} aria-hidden="true">
        <span />
        <div>
          {ticks(max).map((t) => (
            <span key={t}>{usdCompact(t)}</span>
          ))}
        </div>
        <span />
      </div>
    </div>
  );
}
