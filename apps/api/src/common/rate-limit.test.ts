import { Controller, Get, Post } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { registerRateLimit } from './rate-limit.js';

@Controller()
class PingController {
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('ping')
  write() {
    return { ok: true };
  }
}

async function appWith(limits: { reads: number; writes: number; banAfter: number }) {
  const moduleRef = await Test.createTestingModule({ controllers: [PingController] }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await registerRateLimit(app, {
    readsPerMinute: limits.reads,
    writesPerMinute: limits.writes,
    banAfter: limits.banAfter,
  });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

const hit = (app: NestFastifyApplication, method: 'GET' | 'POST' = 'GET') =>
  app.inject({ method, url: '/ping' }).then((r) => r.statusCode);

describe('rate limiting', () => {
  let app: NestFastifyApplication;
  afterEach(() => app?.close());

  it('answers 429 once a client exceeds its per-minute budget', async () => {
    app = await appWith({ reads: 3, writes: 1, banAfter: 100 });
    expect([await hit(app), await hit(app), await hit(app)]).toEqual([200, 200, 200]);
    expect(await hit(app)).toBe(429);
  });

  it('gives writes a tighter budget than reads, counted separately', async () => {
    app = await appWith({ reads: 5, writes: 1, banAfter: 100 });
    expect(await hit(app, 'POST')).toBe(201);
    expect(await hit(app, 'POST')).toBe(429);
    expect(await hit(app)).toBe(200);
  });

  it('bans a client that keeps hammering after being limited', async () => {
    app = await appWith({ reads: 1, writes: 1, banAfter: 2 });
    const codes = [];
    for (let i = 0; i < 5; i++) codes.push(await hit(app));
    expect(codes[0]).toBe(200);
    expect(codes).toContain(429);
    expect(codes.at(-1)).toBe(403);
  });
});
