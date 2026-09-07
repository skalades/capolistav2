import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { StatusOutput } from '@prisma/client';

export class UpdateOutputDto {
  @IsOptional()
  @IsInt()
  pcsKlaim?: number;

  @IsOptional()
  @IsString()
  catatanMandor?: string;
}

export class ApproveOutputDto {
  @IsInt()
  pcsApproved: number;

  @IsEnum(StatusOutput)
  status: StatusOutput;

  @IsOptional()
  @IsString()
  catatanMandor?: string;
}
