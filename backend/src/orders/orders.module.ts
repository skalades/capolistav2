import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { OrdersPdfService } from './orders-pdf.service.js';
import { OrdersCronService } from './orders-cron.service.js';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPdfService, OrdersCronService],
})
export class OrdersModule {}
