import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { FinanceController } from './finance.controller.js';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
