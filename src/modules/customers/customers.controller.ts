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
  ParseBooleanPipe,
  ParseObjectIdPipe,
} from '../../common/pipes';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

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
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseObjectIdPipe('id')) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.service.update(id, dto);
  }
}
