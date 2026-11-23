import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Employee } from '@acme/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmployeesRepository } from './employees.repository.js';
import { EmployeesService } from './employees.service.js';

const lena: Employee = {
  id: 7,
  employeeCode: 'EMP-00007',
  fullName: 'Lena Hoffmann',
  email: 'lena@acme.example',
  jobTitle: 'Data Engineer',
  department: 'Engineering',
  level: 3,
  countryCode: 'DE',
  countryName: 'Germany',
  currency: 'EUR',
  salary: 61_000,
  salaryUsd: 66_185,
  hiredOn: '2022-04-01',
  bandMin: 58_000,
  bandMax: 82_000,
  bandStatus: 'within',
  gapUsd: 0,
};

function fakeRepo() {
  return {
    findById: vi.fn(async (id: number) => (id === lena.id ? lena : undefined)),
    history: vi.fn(async () => []),
    update: vi.fn(async () => true),
    insert: vi.fn(async () => 99),
    nextEmployeeCode: vi.fn(async () => 'EMP-10001'),
    delete: vi.fn(async () => false),
    list: vi.fn(),
  };
}

describe('EmployeesService', () => {
  let repo: ReturnType<typeof fakeRepo>;
  let service: EmployeesService;

  beforeEach(() => {
    repo = fakeRepo();
    service = new EmployeesService(repo as unknown as EmployeesRepository);
  });

  it('records a salary change with the old value, new value and reason', async () => {
    await service.update(7, { salary: 66_000, salaryChangeReason: 'Annual review' });

    expect(repo.update).toHaveBeenCalledWith(7, { salary: 66_000 }, {
      previousSalary: 61_000,
      previousCurrency: 'EUR',
      newSalary: 66_000,
      currency: 'EUR',
      reason: 'Annual review',
    });
  });

  it('does not write history when the salary is unchanged', async () => {
    await service.update(7, { jobTitle: 'Senior Data Engineer' });
    expect(repo.update).toHaveBeenCalledWith(7, { jobTitle: 'Senior Data Engineer' }, undefined);
  });

  it('requires a new salary when an employee moves country, and records the currency switch', async () => {
    await expect(service.update(7, { countryCode: 'GB' })).rejects.toBeInstanceOf(BadRequestException);

    await service.update(7, { countryCode: 'GB', salary: 54_000 });
    expect(repo.update).toHaveBeenLastCalledWith(
      7,
      { countryCode: 'GB', salary: 54_000 },
      expect.objectContaining({ previousCurrency: 'EUR', currency: 'GBP', reason: 'Relocation' }),
    );
  });

  it('turns a duplicate email into a conflict instead of a server error', async () => {
    repo.insert.mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: '23505' }));
    await expect(
      service.create({ ...lena, level: 3, salary: 61_000 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('reports missing employees as not found', async () => {
    await expect(service.get(404)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update(404, { salary: 1 })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(404)).rejects.toBeInstanceOf(NotFoundException);
  });
});
