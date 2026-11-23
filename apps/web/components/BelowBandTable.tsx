import type { Employee } from '@acme/shared';
import Link from 'next/link';
import { money, signedUsd, usd } from '@/lib/format';
import styles from './Table.module.css';

export function BelowBandTable({ rows, empty }: { rows: Employee[]; empty: string }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Employee</th>
            <th scope="col" className={styles.hideSm}>
              Country
            </th>
            <th scope="col" className={styles.hideSm}>
              Level
            </th>
            <th scope="col" className={styles.n}>
              Base salary
            </th>
            <th scope="col" className={styles.n}>
              Gap to band
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.empty}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((e, i) => (
              <tr key={e.id} className={styles.enter} style={{ animationDelay: `${i * 35}ms` }}>
                <td>
                  <Link href={`/employees/${e.id}`} className={styles.rowLink}>
                    {e.fullName}
                  </Link>
                  <small>
                    {e.jobTitle} · {e.employeeCode}
                  </small>
                </td>
                <td className={styles.hideSm}>{e.countryName}</td>
                <td className={styles.hideSm}>L{e.level}</td>
                <td className={styles.n}>
                  {money(e.salary, e.currency)}
                  {e.currency !== 'USD' ? <small>{usd(e.salaryUsd)}</small> : null}
                </td>
                <td className={`${styles.n} ${styles.gap}`}>{signedUsd(e.gapUsd)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
