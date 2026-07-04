import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ListQueryParams } from '../../common/interfaces/list-query.interface';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryParams & { all?: boolean }) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.SupplierWhereInput = {
      ...(query.all ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.ensureExists(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  private async ensureExists(id: string) {
    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Supplier not found');
    return row;
  }
}
