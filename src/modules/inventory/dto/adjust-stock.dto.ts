import { MovementType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsString()
  warehouseId: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
