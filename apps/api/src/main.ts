import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { registerRateLimit } from './common/rate-limit.js';
import { loadConfig } from './config.js';

const config = loadConfig();

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ trustProxy: config.TRUST_PROXY, bodyLimit: 64 * 1024 }),
  { logger: ['error', 'warn', 'log'] },
);

await registerRateLimit(app, {
  readsPerMinute: config.RATE_LIMIT_READS,
  writesPerMinute: config.RATE_LIMIT_WRITES,
  banAfter: config.RATE_LIMIT_BAN_AFTER,
});

app.setGlobalPrefix('api');
app.enableCors({
  origin: config.WEB_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
app.enableShutdownHooks();

await app.listen(config.API_PORT, config.API_HOST);
