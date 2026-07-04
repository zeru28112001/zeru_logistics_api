import { IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  salesOrderId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
