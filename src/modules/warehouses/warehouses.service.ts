import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Warehouse } from '@prisma/client';
import { ListQueryParams } from '../../common/interfaces/list-query.interface';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryParams & { all?: boolean }) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.WarehouseWhereInput = {
      ...(query.all ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.warehouse.findUnique({ where: { id } });
  }

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.ensureExists(id);
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.warehouse.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string): Promise<Warehouse> {
    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Warehouse not found');
    return row;
  }
}
