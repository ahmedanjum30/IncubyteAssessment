const cache = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, compact = false): Intl.NumberFormat {
  const key = `${currency}:${compact}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? 'compact' : 'standard',
    });
    cache.set(key, f);
  }
  return f;
}

export const money = (amount: number, currency: string) => formatter(currency).format(amount);

export const usd = (amount: number) => formatter('USD').format(amount);

export const usdCompact = (amount: number) => formatter('USD', true).format(amount);

export const signedUsd = (amount: number) =>
  amount === 0 ? usd(0) : `${amount < 0 ? '−' : '+'}${usd(Math.abs(amount))}`;

const integer = new Intl.NumberFormat('en-US');
export const count = (n: number) => integer.format(n);

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
export const date = (iso: string) => dateFormat.format(new Date(iso));
