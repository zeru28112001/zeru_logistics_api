import {
  Body,
  Controller,
  DefaultValuePipe,
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
  ParseObjectIdPipe,
  ParseOptionalObjectIdPipe,
} from '../../common/pipes';
import { ShipmentsService } from '../../services/shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly service: ShipmentsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('salesOrderId', new ParseOptionalObjectIdPipe('salesOrderId'))
    salesOrderId?: string,
    @Query('driverId', new ParseOptionalObjectIdPipe('driverId'))
    driverId?: string,
  ) {
    return this.service.findAll({
      page,
      size,
      search,
      salesOrderId,
      driverId,
    });
  }

  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe('id')) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseObjectIdPipe('id')) id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }
}
