import { IsInt, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignDto {
  @IsInt()
  orderId: number;

  @IsInt()
  operatorId: number;

  @IsNumber()
  tarifPerPcs: number;

  @IsOptional()
  @IsDateString()
  tanggalAssign?: string;
}
