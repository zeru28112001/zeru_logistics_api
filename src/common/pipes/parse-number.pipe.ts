import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNumber } from 'class-validator';

@Injectable()
export class ParseNumberPipe implements PipeTransform<number> {
  constructor(private readonly valueName: string) {}

  transform(value: unknown): number | undefined {
    const errorMessage = `Invalid ${this.valueName} value, ${this.valueName} must be number`;

    try {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      if (!isNumber(Number(value))) {
        throw new Error(errorMessage);
      }

      return Number(value);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : errorMessage,
      );
    }
  }
}
