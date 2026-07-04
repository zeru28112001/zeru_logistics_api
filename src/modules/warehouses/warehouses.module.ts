import { Module } from '@nestjs/common';
import { WarehousesService } from '../../services/warehouses.service';
import { WarehousesController } from './warehouses.controller';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService],
})
export class WarehousesModule {}
