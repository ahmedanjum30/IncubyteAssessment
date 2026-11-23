'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './TopBar.module.css';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/employees', label: 'Employees' },
  { href: '/insights', label: 'Pay insights' },
];

export function TopBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.name}>
        <i aria-hidden="true" />
        ACME Pay
      </Link>
      <nav aria-label="Main" className={styles.nav}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
