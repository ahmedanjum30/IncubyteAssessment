'use client';

import { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number | null | undefined;
  format: (n: number) => string;
  duration?: number;
}

export function CountUp({ value, format, duration = 700 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === null || value === undefined) return;
    const start = from.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || start === value) {
      el.textContent = format(value);
      from.current = value;
      return;
    }
    const t0 = performance.now();
    let frame = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - (1 - k) ** 4;
      el.textContent = format(start + (value - start) * eased);
      if (k < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      from.current = value;
    };
  }, [value, format, duration]);

  return (
    <span ref={ref}>
      {value === null || value === undefined ? '—' : format(0)}
    </span>
  );
}
