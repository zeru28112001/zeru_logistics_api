import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesOrdersController } from './sales-orders.controller';

@Module({
  imports: [InventoryModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
})
export class SalesOrdersModule {}
