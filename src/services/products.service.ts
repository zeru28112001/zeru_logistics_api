import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/utils/pagination.util';
import { ListQueryParams } from '../common/interfaces/list-query.interface';
import { CreateProductDto } from '../modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../modules/products/dto/update-product.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListQueryParams & { all?: boolean; categoryId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.ProductWhereInput = {
      ...(query.all ? {} : { isActive: true }),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { barcode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  findBySku(sku: string) {
    return this.prisma.product.findUnique({
      where: { sku },
      include: { category: true },
    });
  }

  findByBarcode(barcode: string) {
    return this.prisma.product.findUnique({
      where: { barcode },
      include: { category: true },
    });
  }

  create(dto: CreateProductDto) {
    const { categoryId, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        ...(categoryId
          ? { category: { connect: { id: categoryId } } }
          : {}),
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const { categoryId, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined
          ? categoryId
            ? { category: { connect: { id: categoryId } } }
            : { category: { disconnect: true } }
          : {}),
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true },
    });
  }

  private async ensureExists(id: string) {
    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }
}
