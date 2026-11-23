import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { InsightsModule } from './insights/insights.module.js';
import { MetaController } from './meta/meta.controller.js';

@Module({
  imports: [DatabaseModule, EmployeesModule, InsightsModule],
  controllers: [MetaController],
})
export class AppModule {}
