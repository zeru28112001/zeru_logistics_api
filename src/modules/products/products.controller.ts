import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '../../common/constants';
import {
  ParseBooleanPipe,
  ParseObjectIdPipe,
  ParseOptionalObjectIdPipe,
  ParseStringPipe,
} from '../../common/pipes';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('all', new ParseBooleanPipe('all')) all?: boolean,
    @Query('categoryId', new ParseOptionalObjectIdPipe('categoryId'))
    categoryId?: string,
  ) {
    return this.service.findAll({ page, size, search, all, categoryId });
  }

  @Get('barcode/:code')
  findByBarcode(@Param('code', new ParseStringPipe('code')) code: string) {
    return this.service.findByBarcode(code);
  }

  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseObjectIdPipe('id')) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.remove(id);
  }
}
