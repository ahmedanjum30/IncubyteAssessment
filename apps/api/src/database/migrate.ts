import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { COUNTRIES, DEPARTMENTS, FX_AS_OF, LEVELS, bandFor } from '@acme/shared';
import type { Sql } from './client.js';

const MIGRATIONS_DIR = resolve(import.meta.dirname, '../../migrations');
const LOCK_ID = 7_340_021;

export async function migrate(sql: Sql, dir = MIGRATIONS_DIR): Promise<string[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const applied: string[] = [];

  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${LOCK_ID})`;
    await tx`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
    const done = new Set((await tx<{ name: string }[]>`select name from schema_migrations`).map((r) => r.name));
    for (const file of files) {
      if (done.has(file)) continue;
      await tx.unsafe(await readFile(join(dir, file), 'utf8'));
      await tx`insert into schema_migrations ${tx({ name: file })}`;
      applied.push(file);
    }
  });

  return applied;
}

export async function syncReferenceData(sql: Sql): Promise<void> {
  const countries = COUNTRIES.map(({ code, name, currency }) => ({ code, name, currency }));
  const rates = [...new Map(COUNTRIES.map((c) => [c.currency, c])).values()].map((c) => ({
    currency: c.currency,
    usdPerUnit: c.usdPerUnit,
    asOf: FX_AS_OF,
  }));
  const bands = COUNTRIES.flatMap((c) =>
    DEPARTMENTS.flatMap((department) =>
      LEVELS.map((level) => {
        const band = bandFor(c.code, department, level);
        return { countryCode: c.code, department, level, minSalary: band.min, maxSalary: band.max };
      }),
    ),
  );

  await sql.begin(async (tx) => {
    await tx`
      insert into countries ${tx(countries, 'code', 'name', 'currency')}
      on conflict (code) do update set name = excluded.name, currency = excluded.currency`;
    await tx`
      insert into fx_rates ${tx(rates, 'currency', 'usdPerUnit', 'asOf')}
      on conflict (currency) do update set usd_per_unit = excluded.usd_per_unit, as_of = excluded.as_of`;
    await tx`
      insert into pay_bands ${tx(bands, 'countryCode', 'department', 'level', 'minSalary', 'maxSalary')}
      on conflict (country_code, department, level)
      do update set min_salary = excluded.min_salary, max_salary = excluded.max_salary`;
  });
}
