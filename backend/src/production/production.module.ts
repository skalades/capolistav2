import { Module } from '@nestjs/common';
import { ProductionController } from './production.controller.js';
import { ProductionService } from './production.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, PrismaService],
})
export class ProductionModule {}
