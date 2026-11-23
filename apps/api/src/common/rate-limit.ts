import rateLimit from '@fastify/rate-limit';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';

export interface RateLimitOptions {
  readsPerMinute: number;
  writesPerMinute: number;
  banAfter: number;
}

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const isWrite = (req: FastifyRequest) => WRITE_METHODS.has(req.method);

export async function registerRateLimit(app: NestFastifyApplication, options: RateLimitOptions) {
  await app.register(rateLimit, {
    global: true,
    timeWindow: '1 minute',
    max: (req) => (isWrite(req) ? options.writesPerMinute : options.readsPerMinute),
    keyGenerator: (req) => `${req.ip}:${isWrite(req) ? 'w' : 'r'}`,
    ban: options.banAfter,
    allowList: (req) => req.url === '/api/health' && (req.ip === '127.0.0.1' || req.ip === '::1'),
    errorResponseBuilder: (_req, ctx) =>
      ctx.ban
        ? new HttpException(
            'Too many requests. Access is blocked for the rest of this minute.',
            HttpStatus.FORBIDDEN,
          )
        : new HttpException(
            `Too many requests. Try again in ${ctx.after}.`,
            HttpStatus.TOO_MANY_REQUESTS,
          ),
  });
}
