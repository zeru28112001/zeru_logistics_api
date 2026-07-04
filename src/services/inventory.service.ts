import { Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/utils/pagination.util';
import { ListQueryParams } from '../common/interfaces/list-query.interface';
import { AdjustStockDto } from '../modules/inventory/dto/adjust-stock.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(
    query: ListQueryParams & { warehouseId?: string; productId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.InventoryStockWhereInput = {
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.search
        ? {
            OR: [
              {
                product: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                product: {
                  sku: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.inventoryStock.findMany({
        where,
        include: { product: true, warehouse: true, batch: true },
        orderBy: { product: { name: 'asc' } },
        skip,
        take,
      }),
      this.prisma.inventoryStock.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  async getMovements(
    query: ListQueryParams & { warehouseId?: string; productId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.StockMovementWhereInput = {
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: true, warehouse: true, batch: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  async getBatches(query: ListQueryParams & { productId?: string }) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.ProductBatchWhereInput = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.search
        ? { lotNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.productBatch.findMany({
        where,
        include: { product: true },
        orderBy: { expiryDate: 'asc' },
        skip,
        take,
      }),
      this.prisma.productBatch.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  async getSerials(
    query: ListQueryParams & { productId?: string; warehouseId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.SerialNumberWhereInput = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.search
        ? { serialNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.serialNumber.findMany({
        where,
        include: { product: true, warehouse: true, batch: true },
        orderBy: { serialNumber: 'asc' },
        skip,
        take,
      }),
      this.prisma.serialNumber.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  async adjustStock(dto: AdjustStockDto) {
    let stock = await this.prisma.inventoryStock.findFirst({
      where: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        batchId: dto.batchId ?? null,
      },
    });

    const newQty = Number(stock?.quantity ?? 0) + dto.quantity;

    if (!stock) {
      stock = await this.prisma.inventoryStock.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          batchId: dto.batchId,
          quantity: newQty,
        },
        include: { product: true, warehouse: true, batch: true },
      });
    } else {
      stock = await this.prisma.inventoryStock.update({
        where: { id: stock.id },
        data: { quantity: newQty },
        include: { product: true, warehouse: true, batch: true },
      });
    }

    await this.prisma.stockMovement.create({
      data: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        batchId: dto.batchId,
        movementType: dto.movementType ?? MovementType.adjustment,
        quantity: dto.quantity,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        notes: dto.notes,
        createdBy: dto.createdBy,
      },
    });

    return stock;
  }
}
