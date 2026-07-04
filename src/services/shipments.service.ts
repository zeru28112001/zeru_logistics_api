import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ShipmentStatus } from '@prisma/client';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/utils/pagination.util';
import { ListQueryParams } from '../common/interfaces/list-query.interface';
import { CreateShipmentDto } from '../modules/shipments/dto/create-shipment.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListQueryParams & { salesOrderId?: string; driverId?: string },
  ) {
    const { page, size, skip, take } = getPaginationParams(
      query.page,
      query.size,
    );
    const where: Prisma.ShipmentWhereInput = {
      ...(query.salesOrderId ? { salesOrderId: query.salesOrderId } : {}),
      ...(query.driverId ? { driverId: query.driverId } : {}),
      ...(query.search
        ? {
            OR: [
              {
                shipmentNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        include: {
          salesOrder: { include: { customer: true } },
          driver: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, size);
  }

  findOne(id: string) {
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true, items: true } },
        driver: true,
      },
    });
  }

  async create(dto: CreateShipmentDto) {
    const count = await this.prisma.shipment.count();
    const shipmentNumber = `SH-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.shipment.create({
      data: {
        ...dto,
        shipmentNumber,
        status: ShipmentStatus.pending,
      },
      include: {
        salesOrder: { include: { customer: true } },
        driver: true,
      },
    });
  }

  async updateStatus(id: string, status: ShipmentStatus) {
    await this.ensureExists(id);

    return this.prisma.shipment.update({
      where: { id },
      data: {
        status,
        ...(status === ShipmentStatus.in_transit
          ? { shippedAt: new Date() }
          : {}),
        ...(status === ShipmentStatus.delivered
          ? { deliveredAt: new Date() }
          : {}),
      },
      include: {
        salesOrder: { include: { customer: true, items: true } },
        driver: true,
      },
    });
  }

  private async ensureExists(id: string) {
    const row = await this.findOne(id);
    if (!row) throw new NotFoundException('Shipment not found');
    return row;
  }
}
