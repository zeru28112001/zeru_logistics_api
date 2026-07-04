import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string> {
  constructor(private readonly valueName: string) {}

  transform(value: unknown): Date | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsedDate = new Date(String(value));

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        `Invalid ${this.valueName} format, expected a valid date string`,
      );
    }

    return parsedDate;
  }
}
