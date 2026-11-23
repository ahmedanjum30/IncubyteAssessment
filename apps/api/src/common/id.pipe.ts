import { BadRequestException, type PipeTransform } from '@nestjs/common';

const MAX_ID = 2_147_483_647;

export class IdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1 || id > MAX_ID) {
      throw new BadRequestException('Employee id must be a positive whole number');
    }
    return id;
  }
}
