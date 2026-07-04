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
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly service: SalesOrdersService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('customerId', new ParseOptionalObjectIdPipe('customerId'))
    customerId?: string,
    @Query('warehouseId', new ParseOptionalObjectIdPipe('warehouseId'))
    warehouseId?: string,
  ) {
    return this.service.findAll({
      page,
      size,
      search,
      customerId,
      warehouseId,
    });
  }

  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSalesOrderDto) {
    return this.service.create(dto);
  }

  @Post(':id/pick')
  pick(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.confirmAndPick(id);
  }
}
