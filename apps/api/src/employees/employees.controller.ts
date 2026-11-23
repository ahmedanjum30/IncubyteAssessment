import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  employeeInputSchema,
  employeeListQuerySchema,
  employeeUpdateSchema,
  type EmployeeInput,
  type EmployeeListQuery,
  type EmployeeUpdate,
} from '@acme/shared';
import { IdPipe } from '../common/id.pipe.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { EmployeesService } from './employees.service.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  list(@Query(new ZodPipe(employeeListQuerySchema)) query: EmployeeListQuery) {
    return this.employees.list(query);
  }

  @Get(':id')
  get(@Param('id', IdPipe) id: number) {
    return this.employees.get(id);
  }

  @Post()
  create(@Body(new ZodPipe(employeeInputSchema)) body: EmployeeInput) {
    return this.employees.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', IdPipe) id: number,
    @Body(new ZodPipe(employeeUpdateSchema)) body: EmployeeUpdate,
  ) {
    return this.employees.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', IdPipe) id: number) {
    await this.employees.remove(id);
  }
}
