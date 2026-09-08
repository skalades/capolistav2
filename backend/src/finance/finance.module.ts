import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { FinanceController } from './finance.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, PrismaService],
})
export class FinanceModule {}
