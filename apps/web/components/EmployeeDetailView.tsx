'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, api, keys } from '@/lib/api';
import { date, money, signedUsd, usd } from '@/lib/format';
import { percentOf } from '@/lib/scale';
import { Dialog } from './Dialog';
import { EmployeeForm } from './EmployeeForm';
import { Plate } from './Plate';
import styles from './EmployeeDetailView.module.css';

export function EmployeeDetailView({ id }: { id: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { data: e, error, isLoading } = useQuery({
    queryKey: keys.employee(id),
    queryFn: ({ signal }) => api.employee(id, signal),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteEmployee(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.employee(id) });
      void queryClient.invalidateQueries({ queryKey: keys.employees });
      void queryClient.invalidateQueries({ queryKey: keys.insights });
      router.push('/employees');
    },
  });

  if (isLoading) {
    return (
      <main className={styles.page} aria-busy="true">
        <p className="muted">Loading employee…</p>
      </main>
    );
  }

  if (error || !e) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <main className={styles.page}>
        <h1 className={styles.name}>{notFound ? 'Employee not found' : 'Could not load employee'}</h1>
        <p className="muted">
          {notFound ? 'They may have been removed.' : 'Check your connection and try again.'}{' '}
          <Link href="/employees" className="link">
            Back to employees
          </Link>
        </p>
      </main>
    );
  }

  const hasBand = e.bandMin !== null && e.bandMax !== null;
  const scaleMax = hasBand ? Math.max(e.bandMax! * 1.25, e.salary * 1.05) : e.salary;
  const scaleMin = hasBand ? Math.min(e.bandMin! * 0.75, e.salary * 0.95) : 0;
  const at = (v: number) => percentOf(v - scaleMin, scaleMax - scaleMin);

  return (
    <main className={styles.page}>
      <Link href="/employees" className={`mono muted ${styles.back}`}>
        ← Employees
      </Link>
      <div className={styles.head}>
        <div>
          <h1 className={styles.name}>{e.fullName}</h1>
          <p className="muted">
            {e.jobTitle} · L{e.level} · {e.department} · {e.countryName}
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
            Delete
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      </div>

      <section className={styles.stats} aria-label="Pay">
        <div>
          <span className="mono muted">Base salary, {e.currency}</span>
          <b>{money(e.salary, e.currency)}</b>
        </div>
        <div>
          <span className="mono muted">In USD</span>
          <b>{usd(e.salaryUsd)}</b>
        </div>
        <div className={e.bandStatus === 'below' ? styles.attention : undefined}>
          <span className="mono muted">Gap to band</span>
          <b>{e.bandStatus === 'within' ? 'In band' : signedUsd(e.gapUsd)}</b>
        </div>
      </section>

      <Plate id="band" title="Position in band" meta={`${e.countryName} · ${e.department} · L${e.level}`} className={styles.bandPlate}>
        {hasBand ? (
          <figure className={styles.bandFigure}>
            <div className={styles.bandTrack}>
              <span
                className={styles.bandRange}
                style={{ left: `${at(e.bandMin!)}%`, width: `${at(e.bandMax!) - at(e.bandMin!)}%` }}
              />
              <span
                className={`${styles.marker} ${e.bandStatus === 'below' ? styles.markerAttention : ''}`}
                style={{ left: `${at(e.salary)}%` }}
              />
            </div>
            <figcaption className={`mono muted ${styles.bandScale}`}>
              <span style={{ left: `${at(e.bandMin!)}%` }}>Min {money(e.bandMin!, e.currency)}</span>
              <span style={{ left: `${at(e.bandMax!)}%` }}>Max {money(e.bandMax!, e.currency)}</span>
            </figcaption>
          </figure>
        ) : (
          <p className="muted">No pay band is defined for this combination.</p>
        )}
        <dl className={styles.facts}>
          <div>
            <dt className="mono muted">Employee code</dt>
            <dd>{e.employeeCode}</dd>
          </div>
          <div>
            <dt className="mono muted">Email</dt>
            <dd>{e.email}</dd>
          </div>
          <div>
            <dt className="mono muted">Hired</dt>
            <dd>{date(e.hiredOn)}</dd>
          </div>
        </dl>
      </Plate>

      <Plate id="history" title="Salary history" meta={`${e.history.length} changes`} className={styles.historyPlate}>
        {e.history.length === 0 ? (
          <p className="muted">No changes since hire. Edits to salary are recorded here with their reason.</p>
        ) : (
          <ol className={styles.history}>
            {e.history.map((h) => (
              <li key={h.id}>
                <span className="mono muted">{date(h.changedAt)}</span>
                <span className="num">
                  <s>{money(h.previousSalary, h.previousCurrency)}</s> → {money(h.newSalary, h.currency)}
                </span>
                <span className="muted">{h.reason ?? 'No reason given'}</span>
              </li>
            ))}
          </ol>
        )}
      </Plate>

      <Dialog open={editing} onOpenChange={setEditing} title="Edit employee" wide>
        <EmployeeForm employee={e} onCancel={() => setEditing(false)} onDone={() => setEditing(false)} />
      </Dialog>

      <Dialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete employee?"
        description={`${e.fullName} and their salary history will be removed. This cannot be undone.`}
      >
        {remove.isError ? (
          <p className="error-text" role="alert">
            Could not delete. Try again.
          </p>
        ) : null}
        <div className={styles.confirm}>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
            Keep
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            {remove.isPending ? 'Deleting…' : 'Delete employee'}
          </button>
        </div>
      </Dialog>
    </main>
  );
}
