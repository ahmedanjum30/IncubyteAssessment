import { Inject, Injectable } from '@nestjs/common';
import type {
  BelowBandQuery,
  CountryDistribution,
  Employee,
  InsightFilter,
  JobTitleStats,
  Summary,
} from '@acme/shared';
import { whereAll, type Fragment } from '../common/sql.js';
import { SQL, type Sql } from '../database/client.js';

const round = (n: number | null) => (n === null ? null : Math.round(n));

@Injectable()
export class InsightsService {
  constructor(@Inject(SQL) private readonly sql: Sql) {}

  private filters(filter: InsightFilter, extra: Fragment[] = []) {
    const sql = this.sql;
    const conditions: Fragment[] = [...extra];
    if (filter.country) conditions.push(sql`country_code = ${filter.country}`);
    if (filter.department) conditions.push(sql`department = ${filter.department}`);
    return whereAll(sql, conditions);
  }

  async summary(filter: InsightFilter): Promise<Summary> {
    const [row] = await this.sql<Summary[]>`
      select
        count(*)::int as headcount,
        percentile_cont(0.5) within group (order by salary_usd) as median_usd,
        avg(salary_usd)::float8 as average_usd,
        count(*) filter (where band_status = 'below')::int as below_band,
        count(distinct country_code)::int as countries
      from employee_pay ${this.filters(filter)}`;
    return { ...row!, medianUsd: round(row!.medianUsd), averageUsd: round(row!.averageUsd) };
  }

  async distribution(filter: InsightFilter): Promise<CountryDistribution[]> {
    const rows = await this.sql<
      (Omit<CountryDistribution, 'p10' | 'p25' | 'median' | 'p75' | 'p90'> & { p: number[] })[]
    >`
      select
        country_code,
        country_name,
        count(*)::int as headcount,
        percentile_cont(array[0.1, 0.25, 0.5, 0.75, 0.9]) within group (order by salary_usd) as p,
        percentile_cont(0.5) within group (order by band_min * usd_per_unit) as band_min_median,
        count(*) filter (where band_status = 'below')::int as below_band
      from employee_pay ${this.filters(filter)}
      group by country_code, country_name
      order by 4 desc`;
    return rows.map(({ p, ...r }) => ({
      ...r,
      countryCode: r.countryCode.trim() as CountryDistribution['countryCode'],
      p10: Math.round(p[0]!),
      p25: Math.round(p[1]!),
      median: Math.round(p[2]!),
      p75: Math.round(p[3]!),
      p90: Math.round(p[4]!),
      bandMinMedian: round(r.bandMinMedian),
    }));
  }

  async jobTitles(filter: InsightFilter): Promise<JobTitleStats[]> {
    const rows = await this.sql<JobTitleStats[]>`
      select
        job_title,
        department,
        count(*)::int as headcount,
        min(salary_usd)::float8 as min_usd,
        percentile_cont(0.5) within group (order by salary_usd) as median_usd,
        avg(salary_usd)::float8 as average_usd,
        max(salary_usd)::float8 as max_usd
      from employee_pay ${this.filters(filter)}
      group by job_title, department
      order by department, median_usd desc`;
    return rows.map((r) => ({
      ...r,
      minUsd: Math.round(r.minUsd),
      medianUsd: Math.round(r.medianUsd),
      averageUsd: Math.round(r.averageUsd),
      maxUsd: Math.round(r.maxUsd),
    }));
  }

  belowBand(query: BelowBandQuery): Promise<Employee[]> {
    return this.sql<Employee[]>`
      select id, employee_code, full_name, email, job_title, department, level, country_code,
        country_name, currency, salary, salary_usd, hired_on, band_min, band_max, band_status, gap_usd
      from employee_pay ${this.filters(query, [this.sql`band_status = 'below'`])}
      order by gap_usd asc, id
      limit ${query.limit}`;
  }
}
