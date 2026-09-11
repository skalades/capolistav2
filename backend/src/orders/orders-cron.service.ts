import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersCronService {
  private readonly logger = new Logger(OrdersCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Jalankan setiap hari jam 08:00 pagi
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleOrderReminders() {
    this.logger.debug('Running daily order reminder check...');
    try {
      const today = new Date();
      // Target: 3 hari dari sekarang
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + 3);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Cari order yang belum selesai dan deadline di target date
      const dueOrders = await this.prisma.order.findMany({
        where: {
          deadline: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            notIn: ['SELESAI', 'GUDANG'],
          },
        },
      });

      if (dueOrders.length === 0) {
        this.logger.debug('No orders due in 3 days.');
        return;
      }

      this.logger.log(`Found ${dueOrders.length} order(s) due in 3 days.`);

      // Tambahkan OrderLog untuk setiap order
      for (const order of dueOrders) {
        await this.prisma.orderLog.create({
          data: {
            orderId: order.id,
            type: 'system',
            title: 'Pengingat Deadline',
            desc: `Pengingat: Order ini akan jatuh tempo dalam 3 hari.`,
          },
        });
        this.logger.log(`Added reminder log to order ${order.noOrder}`);
      }
    } catch (error) {
      this.logger.error('Error running order reminder check:', error);
    }
  }
}
