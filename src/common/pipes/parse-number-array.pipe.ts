import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseNumberArrayPipe implements PipeTransform<number[]> {
  constructor(private readonly valueName: string) {}

  transform(value: unknown): number[] | undefined {
    try {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      const parsedValue = Array.isArray(value) ? value : JSON.parse(String(value));
      if (!Array.isArray(parsedValue)) {
        throw new Error(`Invalid array format of ${this.valueName}`);
      }

      return parsedValue.map((item: unknown) => {
        const parsedNumber = Number.parseFloat(String(item));
        if (Number.isNaN(parsedNumber)) {
          throw new Error(
            `Invalid number value: ${String(item)} of ${this.valueName}`,
          );
        }
        return parsedNumber;
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : `Invalid ${this.valueName}`,
      );
    }
  }
}
