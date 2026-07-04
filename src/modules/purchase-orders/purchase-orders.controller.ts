import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '../../common/constants';
import {
  ParseObjectIdPipe,
  ParseOptionalObjectIdPipe,
} from '../../common/pipes';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('supplierId', new ParseOptionalObjectIdPipe('supplierId'))
    supplierId?: string,
    @Query('warehouseId', new ParseOptionalObjectIdPipe('warehouseId'))
    warehouseId?: string,
  ) {
    return this.service.findAll({
      page,
      size,
      search,
      supplierId,
      warehouseId,
    });
  }

  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.service.create(dto);
  }

  @Post(':id/receive')
  receive(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.receive(id);
  }
}
