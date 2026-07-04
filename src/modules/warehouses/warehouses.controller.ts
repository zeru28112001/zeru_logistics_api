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
} from '../../common/pipes';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('all', new ParseBooleanPipe('all')) all?: boolean,
  ) {
    return this.service.findAll({ page, size, search, all });
  }

  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseObjectIdPipe('id')) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.remove(id);
  }
}
