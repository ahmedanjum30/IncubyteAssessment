import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSql, type Sql } from './database/client.js';
import { generateEmployees } from './database/generate.js';
import { migrate, syncReferenceData } from './database/migrate.js';
import { EmployeesRepository } from './employees/employees.repository.js';
import { EmployeesService } from './employees/employees.service.js';
import { InsightsService } from './insights/insights.service.js';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('against PostgreSQL', () => {
  let sql: Sql;
  let employees: EmployeesService;
  let insights: InsightsService;

  beforeAll(async () => {
    sql = createSql(url!, 4);
    await sql`drop schema public cascade`;
    await sql`create schema public`;
    await migrate(sql);
    await syncReferenceData(sql);
    await sql`insert into employees ${sql(generateEmployees(500, 42))}`;
    employees = new EmployeesService(new EmployeesRepository(sql));
    insights = new InsightsService(sql);
  });

  afterAll(() => sql?.end());

  it('applies each migration once', async () => {
    expect(await migrate(sql)).toEqual([]);
  });

  it('filters, sorts and pages employees with a total count', async () => {
    const page = await employees.list({
      country: 'DE',
      sort: 'salary',
      order: 'desc',
      page: 1,
      pageSize: 5,
    });
    expect(page.items.length).toBeLessThanOrEqual(5);
    expect(page.items.every((e) => e.countryCode === 'DE')).toBe(true);
    const salaries = page.items.map((e) => e.salary);
    expect(salaries).toEqual([...salaries].sort((a, b) => b - a));
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
  });

  it('finds employees by partial name, case-insensitively', async () => {
    const [first] = (await employees.list({ sort: 'name', order: 'asc', page: 1, pageSize: 1 }))
      .items;
    const fragment = first!.fullName.slice(1, 5).toLowerCase();
    const found = await employees.list({
      q: fragment,
      sort: 'name',
      order: 'asc',
      page: 1,
      pageSize: 100,
    });
    expect(found.items.map((e) => e.id)).toContain(first!.id);
  });

  it('keeps salary history when a salary changes', async () => {
    const [someone] = (await employees.list({ sort: 'name', order: 'asc', page: 1, pageSize: 1 }))
      .items;
    const updated = await employees.update(someone!.id, {
      salary: someone!.salary + 1000,
      salaryChangeReason: 'Promotion',
    });
    expect(updated.salary).toBe(someone!.salary + 1000);
    expect(updated.history[0]).toMatchObject({
      previousSalary: someone!.salary,
      newSalary: someone!.salary + 1000,
      reason: 'Promotion',
    });
  });

  it('answers pay questions with consistent aggregates', async () => {
    const summary = await insights.summary({});
    const distribution = await insights.distribution({});
    expect(summary.headcount).toBe(500);
    expect(distribution.reduce((s, d) => s + d.headcount, 0)).toBe(500);
    for (const d of distribution) {
      expect(d.p10).toBeLessThanOrEqual(d.p25);
      expect(d.p25).toBeLessThanOrEqual(d.median);
      expect(d.median).toBeLessThanOrEqual(d.p75);
      expect(d.p75).toBeLessThanOrEqual(d.p90);
    }
    const below = await insights.belowBand({ limit: 100 });
    expect(below.every((e) => e.bandStatus === 'below' && e.gapUsd < 0)).toBe(true);
    expect(below.length).toBe(Math.min(100, summary.belowBand));
  });
});
