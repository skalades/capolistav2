import { IsInt, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateAssignDto {
  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsOptional()
  @IsInt()
  operatorId?: number;

  @IsOptional()
  @IsNumber()
  tarifPerPcs?: number;

  @IsOptional()
  @IsDateString()
  tanggalAssign?: string;
}
