import { loadConfig } from '../config.js';
import { createSql } from './client.js';
import { generateEmployees } from './generate.js';
import { migrate, syncReferenceData } from './migrate.js';

const COUNT = Number(process.env.SEED_COUNT ?? 10_000);
const BATCH = 1_000;

const config = loadConfig();
const sql = createSql(config.DATABASE_URL, 2);
const started = performance.now();

try {
  await migrate(sql);
  await syncReferenceData(sql);
  const employees = generateEmployees(COUNT);

  await sql.begin(async (tx) => {
    await tx`truncate employees restart identity cascade`;
    for (let i = 0; i < employees.length; i += BATCH) {
      await tx`insert into employees ${tx(employees.slice(i, i + BATCH))}`;
    }
  });
  await sql`analyze employees`;

  console.warn(`Seeded ${employees.length} employees in ${Math.round(performance.now() - started)} ms`);
} finally {
  await sql.end();
}
