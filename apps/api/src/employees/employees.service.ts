import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  countryByCode,
  type EmployeeDetail,
  type EmployeeInput,
  type EmployeeListQuery,
  type EmployeeUpdate,
} from '@acme/shared';
import { isUniqueViolation } from '../common/sql.js';
import { EmployeesRepository, type SalaryChangeWrite } from './employees.repository.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly repo: EmployeesRepository) {}

  list(query: EmployeeListQuery) {
    return this.repo.list(query);
  }

  async get(id: number): Promise<EmployeeDetail> {
    const [employee, history] = await Promise.all([this.repo.findById(id), this.repo.history(id)]);
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return { ...employee, history };
  }

  async create(input: EmployeeInput): Promise<EmployeeDetail> {
    const id = await this.withUniqueEmail(async () =>
      this.repo.insert(await this.repo.nextEmployeeCode(), input),
    );
    return this.get(id);
  }

  async update(id: number, update: EmployeeUpdate): Promise<EmployeeDetail> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException(`Employee ${id} not found`);

    const { salaryChangeReason, ...changes } = update;
    const relocated = changes.countryCode !== undefined && changes.countryCode !== current.countryCode;
    if (relocated && changes.salary === undefined) {
      throw new BadRequestException('Changing country changes the currency, so a new salary is required');
    }

    const newSalary = changes.salary ?? current.salary;
    const currency = countryByCode(changes.countryCode ?? current.countryCode)!.currency;
    const salaryChange: SalaryChangeWrite | undefined =
      newSalary !== current.salary || relocated
        ? {
            previousSalary: current.salary,
            previousCurrency: current.currency,
            newSalary,
            currency,
            reason: salaryChangeReason ?? (relocated ? 'Relocation' : null),
          }
        : undefined;

    if (Object.keys(changes).length > 0) {
      await this.withUniqueEmail(() => this.repo.update(id, changes, salaryChange));
    }
    return this.get(id);
  }

  async remove(id: number): Promise<void> {
    if (!(await this.repo.delete(id))) throw new NotFoundException(`Employee ${id} not found`);
  }

  private async withUniqueEmail<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('An employee with this email already exists');
      }
      throw error;
    }
  }
}
