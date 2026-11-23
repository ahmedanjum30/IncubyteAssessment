import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { loadConfig } from '../config.js';
import { SQL, createSql, type Sql } from './client.js';
import { migrate, syncReferenceData } from './migrate.js';

@Global()
@Module({
  providers: [
    {
      provide: SQL,
      useFactory: () => {
        const config = loadConfig();
        return createSql(config.DATABASE_URL, config.DB_POOL_MAX, config.DB_STATEMENT_TIMEOUT_MS);
      },
    },
  ],
  exports: [SQL],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger('Database');

  constructor(@Inject(SQL) private readonly sql: Sql) {}

  async onModuleInit() {
    const applied = await migrate(this.sql);
    if (applied.length) this.logger.log(`Applied migrations: ${applied.join(', ')}`);
    await syncReferenceData(this.sql);
  }

  async onApplicationShutdown() {
    await this.sql.end({ timeout: 5 });
  }
}
