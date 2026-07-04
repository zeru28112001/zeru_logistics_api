import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ListQueryParams } from '../../common/interfaces/list-query.interface';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryParams & { all?: boolean }) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.CustomerWhereInput = {
      ...(query.all ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.ensureExists(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  private async ensureExists(id: string) {
    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Customer not found');
    return row;
  }
}
