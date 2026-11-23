import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType, z } from 'zod';

export class ZodPipe<S extends ZodType> implements PipeTransform<unknown, z.infer<S>> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const result = this.schema.safeParse(value ?? {});
    if (result.success) return result.data;
    throw new BadRequestException({
      message: 'Validation failed',
      issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
}
