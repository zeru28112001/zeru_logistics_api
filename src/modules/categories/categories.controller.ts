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
import { CategoriesService } from '../../services/categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(DEFAULT_PAGE), ParseIntPipe)
    page: number,
    @Query('size', new DefaultValuePipe(DEFAULT_PAGE_SIZE), ParseIntPipe)
    size: number,
    @Query('search') search?: string,
    @Query('parentOnly', new ParseBooleanPipe('parentOnly'))
    parentOnly?: boolean,
  ) {
    return this.service.findAll({ page, size, search, parentOnly });
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseObjectIdPipe('id')) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }
}
