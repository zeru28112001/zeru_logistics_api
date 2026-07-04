import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma, SalesOrderStatus } from '@prisma/client';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/utils/pagination.util';
import { ListQueryParams } from '../common/interfaces/list-query.interface';
import { CreateSalesOrderDto } from '../modules/sales-orders/dto/create-sales-order.dto';
import { InventoryService } from './inventory.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async findAll(
    query: ListQueryParams & { customerId?: string; warehouseId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.SalesOrderWhereInput = {
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(query.search
        ? {
            OR: [
              { soNumber: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          warehouse: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        warehouse: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }

  async create(dto: CreateSalesOrderDto) {
    const count = await this.prisma.salesOrder.count();
    const soNumber = `SO-${String(count + 1).padStart(6, '0')}`;

    const items = dto.items.map((i) => ({
      productId: i.productId,
      batchId: i.batchId,
      quantityOrdered: i.quantityOrdered,
      quantityPicked: 0,
      unitPrice: i.unitPrice,
      lineTotal: i.quantityOrdered * i.unitPrice,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return this.prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        orderDate: dto.orderDate,
        deliveryDate: dto.deliveryDate,
        notes: dto.notes,
        status: SalesOrderStatus.draft,
        totalAmount,
        items: { create: items },
      },
      include: {
        customer: true,
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }

  async confirmAndPick(id: string) {
    const so = await this.findOne(id);
    if (!so) throw new NotFoundException('Sales order not found');

    for (const item of so.items) {
      const qty = Number(item.quantityOrdered);
      const stockResult = await this.inventory.getStock({
        warehouseId: so.warehouseId,
        productId: item.productId,
        page: 0,
        size: 1000,
      });
      const available = stockResult.items.reduce(
        (sum, s) => sum + Number(s.quantity),
        0,
      );

      if (available < qty) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}`,
        );
      }

      await this.inventory.adjustStock({
        warehouseId: so.warehouseId,
        productId: item.productId,
        batchId: item.batchId ?? undefined,
        quantity: -qty,
        movementType: MovementType.sale_out,
        referenceType: 'sales_order',
        referenceId: so.id,
        notes: `Pick ${so.soNumber}`,
      });

      await this.prisma.salesOrderItem.update({
        where: { id: item.id },
        data: { quantityPicked: qty },
      });
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.picking },
      include: {
        customer: true,
        warehouse: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }
}
