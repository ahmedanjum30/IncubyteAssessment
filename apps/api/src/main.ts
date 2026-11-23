import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { loadConfig } from './config.js';

const config = loadConfig();

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ trustProxy: true }),
  { logger: ['error', 'warn', 'log'] },
);

app.setGlobalPrefix('api');
app.enableCors({ origin: config.WEB_ORIGIN.split(',') });
app.enableShutdownHooks();

await app.listen(config.API_PORT, config.API_HOST);
