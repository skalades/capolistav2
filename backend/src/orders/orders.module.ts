import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { OrdersPdfService } from './orders-pdf.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPdfService, PrismaService],
})
export class OrdersModule {}
