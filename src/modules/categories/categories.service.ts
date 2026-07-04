import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ListQueryParams } from '../../common/interfaces/list-query.interface';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryParams & { parentOnly?: boolean }) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.CategoryWhereInput = {
      ...(query.parentOnly ? { parentId: null } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        ...(dto.parentId
          ? { parent: { connect: { id: dto.parentId } } }
          : {}),
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.parentId !== undefined
          ? dto.parentId
            ? { parent: { connect: { id: dto.parentId } } }
            : { parent: { disconnect: true } }
          : {}),
      },
    });
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }
}
