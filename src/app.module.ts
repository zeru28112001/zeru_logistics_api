import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommonModule } from './modules/common/common.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    WarehousesModule,
    CategoriesModule,
    ProductsModule,
    SuppliersModule,
    CustomersModule,
    InventoryModule,
    PurchaseOrdersModule,
    SalesOrdersModule,
    ShipmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
