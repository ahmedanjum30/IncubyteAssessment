export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

export function ticks(max: number, count = 3): number[] {
  return Array.from({ length: count }, (_, i) => (max * i) / (count - 1));
}

export function percentOf(value: number, max: number): number {
  return Math.max(0, Math.min(100, (value / max) * 100));
}
