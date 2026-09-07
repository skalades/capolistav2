import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateOutputDto {
  @IsInt()
  assignId: number;

  @IsInt()
  pcsKlaim: number;

  @IsOptional()
  @IsString()
  catatanMandor?: string;
}
