import styles from './Plate.module.css';

interface PlateProps {
  title: string;
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export function Plate({ title, meta, className, children, id }: PlateProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={`${styles.plate} ${className ?? ''}`} aria-labelledby={headingId}>
      <span className={`${styles.reg} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.reg} ${styles.br}`} aria-hidden="true" />
      <div className={styles.head}>
        <h2 id={headingId}>{title}</h2>
        {meta ? <div className={`mono muted ${styles.meta}`}>{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}
