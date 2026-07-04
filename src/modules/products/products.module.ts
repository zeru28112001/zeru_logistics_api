import { Module } from '@nestjs/common';
import { ProductsService } from '../../services/products.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
