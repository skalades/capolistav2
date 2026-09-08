import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const orders = await this.prisma.order.findMany({
      select: { sisaBayar: true, totalHarga: true, dp: true, status: true }
    });

    const totalPiutang = orders.reduce((sum, order) => sum + Number(order.sisaBayar || 0), 0);
    
    const pembayaran = await this.prisma.pembayaran.aggregate({
      _sum: { jumlah: true }
    });
    
    const totalPemasukan = Number(pembayaran._sum.jumlah || 0);

    const waitingDP = orders.filter(o => Number(o.dp) === 0 && Number(o.totalHarga) > 0).length;

    const gaji = await this.prisma.penggajian.aggregate({
      _sum: { totalUpahBersih: true }
    });
    const po = await this.prisma.purchaseOrder.aggregate({
      _sum: { totalHarga: true }
    });
    const totalPengeluaran = Number(gaji._sum.totalUpahBersih || 0) + Number(po._sum.totalHarga || 0);

    return {
      totalPemasukan,
      totalPiutang,
      totalPengeluaran,
      totalOrderMenungguDp: waitingDP
    };
  }

  async findAllPayments() {
    return this.prisma.pembayaran.findMany({
      include: {
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { tanggalBayar: 'desc' }
    });
  }
  
  async createPayment(data: any) {
    const payment = await this.prisma.pembayaran.create({
      data: {
        orderId: data.orderId,
        jumlah: data.jumlah,
        metodePembayaran: data.metodePembayaran,
        buktiPembayaran: data.buktiPembayaran,
      }
    });

    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (order) {
      const newSisa = Number(order.sisaBayar) - Number(data.jumlah);
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          sisaBayar: newSisa < 0 ? 0 : newSisa,
          dp: Number(order.dp) === 0 ? data.jumlah : order.dp
        }
      });
    }

    return payment;
  }
}
