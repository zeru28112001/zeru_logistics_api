import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseStringPipe implements PipeTransform<string> {
  constructor(
    private readonly valueName: string,
    private readonly allowedValues?: string[],
  ) {}

  transform(value: unknown): string | undefined {
    try {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      const stringValue = String(value);

      if (
        this.allowedValues &&
        !this.allowedValues.includes(stringValue)
      ) {
        throw new Error(
          `Invalid ${this.valueName} value, ${this.valueName} must be one of the following values: ${this.allowedValues.join(', ')}`,
        );
      }

      return stringValue;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : `Invalid ${this.valueName}`,
      );
    }
  }
}
