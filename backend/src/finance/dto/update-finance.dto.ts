import { PartialType } from '@nestjs/mapped-types';
import { CreateFinanceDto } from './create-finance.dto.js';

export class UpdateFinanceDto extends PartialType(CreateFinanceDto) {}
