import { Controller, Get, Header, Inject } from '@nestjs/common';
import { COUNTRIES, DEPARTMENTS, FX_AS_OF, JOB_TITLES, LEVELS, type Meta } from '@acme/shared';
import { SQL, type Sql } from '../database/client.js';

const META: Meta = {
  fxAsOf: FX_AS_OF,
  countries: COUNTRIES.map((c) => ({ ...c })),
  departments: DEPARTMENTS,
  jobTitles: Object.fromEntries(
    Object.entries(JOB_TITLES).map(([d, titles]) => [d, titles.map((t) => t.title)]),
  ) as Meta['jobTitles'],
  levels: LEVELS,
};

@Controller()
export class MetaController {
  constructor(@Inject(SQL) private readonly sql: Sql) {}

  @Get('meta')
  @Header('Cache-Control', 'public, max-age=3600')
  meta(): Meta {
    return META;
  }

  @Get('health')
  async health() {
    await this.sql`select 1`;
    return { status: 'ok' };
  }
}
