'use client';

import { useLayoutEffect, useRef } from 'react';
import styles from './Tokens.module.css';

interface TokensProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Tokens<T extends string>({ label, options, value, onChange }: TokensProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  const slab = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const move = () => {
      const active = group.current?.querySelector<HTMLButtonElement>(`[data-value="${value}"]`);
      const el = slab.current;
      if (!active || !el) return;
      if (!placed.current) el.style.transition = 'none';
      el.style.width = `${active.offsetWidth}px`;
      el.style.transform = `translateX(${active.offsetLeft}px)`;
      if (!placed.current) {
        void el.offsetWidth;
        el.style.transition = '';
        placed.current = true;
      }
    };
    move();
    const observer = new ResizeObserver(move);
    if (group.current) observer.observe(group.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">{label}</legend>
      <div ref={group} className={`mono ${styles.tokens}`}>
        <span ref={slab} className={styles.slab} aria-hidden="true" />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={styles.tok}
            data-value={o.value}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
