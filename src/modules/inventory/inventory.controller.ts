import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '../../common/constants';
import { ParseOptionalObjectIdPipe } from '../../common/pipes';
import { InventoryService } from '../../services/inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('stock')
  getStock(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('warehouseId', new ParseOptionalObjectIdPipe('warehouseId'))
    warehouseId?: string,
    @Query('productId', new ParseOptionalObjectIdPipe('productId'))
    productId?: string,
  ) {
    return this.service.getStock({
      page,
      size,
      search,
      warehouseId,
      productId,
    });
  }

  @Get('movements')
  getMovements(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('warehouseId', new ParseOptionalObjectIdPipe('warehouseId'))
    warehouseId?: string,
    @Query('productId', new ParseOptionalObjectIdPipe('productId'))
    productId?: string,
  ) {
    return this.service.getMovements({
      page,
      size,
      search,
      warehouseId,
      productId,
    });
  }

  @Get('batches')
  getBatches(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('productId', new ParseOptionalObjectIdPipe('productId'))
    productId?: string,
  ) {
    return this.service.getBatches({ page, size, search, productId });
  }

  @Get('serials')
  getSerials(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('productId', new ParseOptionalObjectIdPipe('productId'))
    productId?: string,
    @Query('warehouseId', new ParseOptionalObjectIdPipe('warehouseId'))
    warehouseId?: string,
  ) {
    return this.service.getSerials({
      page,
      size,
      search,
      productId,
      warehouseId,
    });
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto) {
    return this.service.adjustStock(dto);
  }
}
