import { Inject, Injectable } from '@nestjs/common';
import type {
  Employee,
  EmployeeInput,
  EmployeeListQuery,
  Page,
  SalaryChange,
  SortField,
} from '@acme/shared';
import { whereAll, type Fragment } from '../common/sql.js';
import { SQL, type Sql } from '../database/client.js';

const COLUMNS = `id, employee_code, full_name, email, job_title, department, level, country_code,
  country_name, currency, salary, salary_usd, hired_on, band_min, band_max, band_status, gap_usd`;

export type EmployeeWrite = EmployeeInput;

export interface SalaryChangeWrite {
  previousSalary: number;
  previousCurrency: string;
  newSalary: number;
  currency: string;
  reason: string | null;
}

@Injectable()
export class EmployeesRepository {
  constructor(@Inject(SQL) private readonly sql: Sql) {}

  private sortColumn(field: SortField) {
    const sql = this.sql;
    const columns: Record<SortField, Fragment> = {
      name: sql`full_name`,
      salary: sql`salary`,
      salaryUsd: sql`salary_usd`,
      level: sql`level`,
      hiredOn: sql`hired_on`,
      country: sql`country_name`,
      gap: sql`gap_usd`,
    };
    return columns[field];
  }

  async list(query: EmployeeListQuery): Promise<Page<Employee>> {
    const sql = this.sql;
    const conditions: Fragment[] = [];
    if (query.q) {
      const like = `%${query.q.replace(/[\\%_]/g, '\\$&')}%`;
      conditions.push(sql`(full_name ilike ${like} or email ilike ${like} or employee_code ilike ${like})`);
    }
    if (query.country) conditions.push(sql`country_code = ${query.country}`);
    if (query.department) conditions.push(sql`department = ${query.department}`);
    if (query.jobTitle) conditions.push(sql`job_title = ${query.jobTitle}`);
    if (query.band) conditions.push(sql`band_status = ${query.band}`);

    const where = whereAll(sql, conditions);
    const direction = query.order === 'desc' ? sql`desc` : sql`asc`;
    const offset = (query.page - 1) * query.pageSize;

    const [rows, [count]] = await Promise.all([
      sql<Employee[]>`
        select ${sql.unsafe(COLUMNS)} from employee_pay ${where}
        order by ${this.sortColumn(query.sort)} ${direction} nulls last, id ${direction}
        limit ${query.pageSize} offset ${offset}`,
      sql<{ total: number }[]>`select count(*)::int as total from employee_pay ${where}`,
    ]);

    return { items: rows, total: count?.total ?? 0, page: query.page, pageSize: query.pageSize };
  }

  async findById(id: number): Promise<Employee | undefined> {
    const [row] = await this.sql<Employee[]>`
      select ${this.sql.unsafe(COLUMNS)} from employee_pay where id = ${id}`;
    return row;
  }

  async history(id: number): Promise<SalaryChange[]> {
    return this.sql<SalaryChange[]>`
      select id, previous_salary, previous_currency, new_salary, currency, reason, changed_at
      from salary_changes where employee_id = ${id}
      order by changed_at desc, id desc`;
  }

  async nextEmployeeCode(): Promise<string> {
    const [row] = await this.sql<{ next: number }[]>`
      select coalesce(max(substring(employee_code from 5)::int), 0) + 1 as next
      from employees where employee_code ~ '^EMP-[0-9]+$'`;
    return `EMP-${String(row?.next ?? 1).padStart(5, '0')}`;
  }

  async insert(employeeCode: string, input: EmployeeWrite): Promise<number> {
    const [row] = await this.sql<{ id: number }[]>`
      insert into employees ${this.sql({ employeeCode, ...input })}
      returning id`;
    return row!.id;
  }

  async update(
    id: number,
    changes: Partial<EmployeeWrite>,
    salaryChange?: SalaryChangeWrite,
  ): Promise<boolean> {
    return this.sql.begin(async (tx) => {
      const [row] = await tx<{ id: number }[]>`
        update employees set ${tx({ ...changes, updatedAt: new Date() })}
        where id = ${id} returning id`;
      if (!row) return false;
      if (salaryChange) {
        await tx`
          insert into salary_changes ${tx({
            employeeId: id,
            previousSalary: salaryChange.previousSalary,
            previousCurrency: salaryChange.previousCurrency,
            newSalary: salaryChange.newSalary,
            currency: salaryChange.currency,
            reason: salaryChange.reason,
          })}`;
      }
      return true;
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.sql`delete from employees where id = ${id}`;
    return result.count > 0;
  }
}
