import { Controller, Get, Query } from '@nestjs/common';
import {
  belowBandQuerySchema,
  insightFilterSchema,
  type BelowBandQuery,
  type InsightFilter,
} from '@acme/shared';
import { ZodPipe } from '../common/zod.pipe.js';
import { InsightsService } from './insights.service.js';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get('summary')
  summary(@Query(new ZodPipe(insightFilterSchema)) filter: InsightFilter) {
    return this.insights.summary(filter);
  }

  @Get('distribution')
  distribution(@Query(new ZodPipe(insightFilterSchema)) filter: InsightFilter) {
    return this.insights.distribution(filter);
  }

  @Get('job-titles')
  jobTitles(@Query(new ZodPipe(insightFilterSchema)) filter: InsightFilter) {
    return this.insights.jobTitles(filter);
  }

  @Get('below-band')
  belowBand(@Query(new ZodPipe(belowBandQuerySchema)) query: BelowBandQuery) {
    return this.insights.belowBand(query);
  }
}
