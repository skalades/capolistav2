import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto.js';
import { IsOptional, IsEnum } from 'class-validator';
import { StatusOrder } from '@prisma/client';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(StatusOrder)
  status?: StatusOrder;
}
