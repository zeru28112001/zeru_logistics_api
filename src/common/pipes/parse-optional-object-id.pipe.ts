import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Injectable()
export class ParseOptionalObjectIdPipe
  implements PipeTransform<string | undefined, string | undefined>
{
  constructor(private readonly valueName = 'id') {}

  transform(value?: string): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (!OBJECT_ID_REGEX.test(value)) {
      throw new BadRequestException(`Invalid ${this.valueName} format`);
    }

    return value;
  }
}
