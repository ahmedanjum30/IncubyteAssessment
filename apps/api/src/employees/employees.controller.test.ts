import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';

const service = {
  list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 25 })),
  get: vi.fn(),
  create: vi.fn(async (body: unknown) => ({ id: 1, ...(body as object), history: [] })),
  update: vi.fn(),
  remove: vi.fn(async () => undefined),
};

describe('EmployeesController (HTTP contract)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => app.close());

  it('passes parsed, defaulted filters to the service', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/employees?country=DE&page=2' });
    expect(res.statusCode).toBe(200);
    expect(service.list).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'DE', page: 2, pageSize: 25, sort: 'name' }),
    );
  });

  it('rejects an oversized page with a readable validation error', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/employees?pageSize=5000' });
    expect(res.statusCode).toBe(400);
    expect(res.json().issues[0].path).toBe('pageSize');
  });

  it('creates an employee from a valid body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/employees',
      payload: {
        fullName: 'Priya Raman',
        email: 'priya@acme.example',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        level: 4,
        countryCode: 'IN',
        salary: 2_940_000,
        hiredOn: '2021-06-14',
      },
    });
    expect(res.statusCode).toBe(201);
  });

  it('lists every invalid field when the body is wrong', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/employees',
      payload: { fullName: 'P', salary: -5 },
    });
    expect(res.statusCode).toBe(400);
    const paths = res.json().issues.map((i: { path: string }) => i.path);
    expect(paths).toEqual(expect.arrayContaining(['fullName', 'email', 'salary', 'countryCode']));
  });

  it('rejects ids that are not positive 32-bit integers before reaching the service', async () => {
    for (const id of ['abc', '0', '-1', '1.5', '99999999999']) {
      const res = await app.inject({ method: 'DELETE', url: `/api/employees/${id}` });
      expect(res.statusCode).toBe(400);
    }
    expect(service.remove).not.toHaveBeenCalled();
  });
});
