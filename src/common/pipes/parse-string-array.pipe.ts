import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseStringArrayPipe implements PipeTransform<
  string | string[],
  string[] | undefined
> {
  constructor(
    private readonly valueName: string,
    private readonly allowedValues?: string[],
  ) {}

  transform(value: unknown): string[] | undefined {
    const formatErrorMessage = `Invalid array format of ${this.valueName}`;
    const valueErrorMessage = `Invalid value in ${this.valueName}, ${this.valueName} must be array of the following values: ${this.allowedValues?.join(', ')}`;

    try {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      let parsedValue: string[];

      if (Array.isArray(value)) {
        parsedValue = value.map(String);
      } else {
        const trimmedValue = String(value).trim();

        if (trimmedValue.startsWith('[')) {
          const jsonParsedValue = JSON.parse(trimmedValue);
          if (!Array.isArray(jsonParsedValue)) {
            throw new Error(formatErrorMessage);
          }
          parsedValue = jsonParsedValue.map(String);
        } else if (trimmedValue.includes(',')) {
          parsedValue = trimmedValue
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          parsedValue = [trimmedValue];
        }
      }

      if (this.allowedValues) {
        const invalid = parsedValue.filter(
          (item) => !this.allowedValues!.includes(item),
        );
        if (invalid.length > 0) {
          throw new Error(valueErrorMessage);
        }
      }

      return parsedValue;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : formatErrorMessage,
      );
    }
  }
}
