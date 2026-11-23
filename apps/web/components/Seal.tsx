import styles from './Seal.module.css';

export function Seal({ className }: { className?: string }) {
  return (
    <svg className={`${styles.seal} ${className ?? ''}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <path id="seal-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <g className={styles.ring}>
        <text
          fontSize="9.4"
          letterSpacing="2.6"
          fill="currentColor"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <textPath href="#seal-ring">NEEDS A DECISION · NEEDS A DECISION · </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="27" fill="var(--seal)" stroke="currentColor" />
      <path d="M40 51l7 7 14-16" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
