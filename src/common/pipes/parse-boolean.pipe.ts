import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string> {
  constructor(private readonly valueName: string) {}

  transform(value: unknown): boolean | undefined {
    const errorMessage = `Invalid ${this.valueName} value, ${this.valueName} must be 'true', 'false', '1', or '0'`;

    try {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      if (value === 'true' || value === '1' || value === true || value === 1) {
        return true;
      }

      if (
        value === 'false' ||
        value === '0' ||
        value === false ||
        value === 0
      ) {
        return false;
      }

      throw new Error(errorMessage);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : errorMessage,
      );
    }
  }
}
