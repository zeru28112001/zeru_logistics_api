import { Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma, PurchaseOrderStatus } from '@prisma/client';
import { ListQueryParams } from '../../common/interfaces/list-query.interface';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async findAll(
    query: ListQueryParams & { supplierId?: string; warehouseId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.PurchaseOrderWhereInput = {
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.search
        ? {
            OR: [
              { poNumber: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          warehouse: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }

  async create(dto: CreatePurchaseOrderDto) {
    const count = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${String(count + 1).padStart(6, '0')}`;

    const items = dto.items.map((i) => ({
      productId: i.productId,
      batchId: i.batchId,
      quantityOrdered: i.quantityOrdered,
      quantityReceived: 0,
      unitPrice: i.unitPrice,
      lineTotal: i.quantityOrdered * i.unitPrice,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        orderDate: dto.orderDate,
        expectedDate: dto.expectedDate,
        notes: dto.notes,
        status: PurchaseOrderStatus.draft,
        totalAmount,
        items: { create: items },
      },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }

  async receive(id: string) {
    const po = await this.findOne(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    for (const item of po.items) {
      const qty =
        Number(item.quantityOrdered) - Number(item.quantityReceived);
      if (qty <= 0) continue;

      await this.inventory.adjustStock({
        warehouseId: po.warehouseId,
        productId: item.productId,
        batchId: item.batchId ?? undefined,
        quantity: qty,
        movementType: MovementType.purchase_in,
        referenceType: 'purchase_order',
        referenceId: po.id,
        notes: `Receive ${po.poNumber}`,
      });

      await this.prisma.purchaseOrderItem.update({
        where: { id: item.id },
        data: { quantityReceived: Number(item.quantityReceived) + qty },
      });
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.received,
        receivedDate: new Date().toISOString().slice(0, 10),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }
}
