import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async assignOperator(orderId: number, operatorId: number, tarifPerPcs: number) {
    // Pastikan order dan operator valid
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const operator = await this.prisma.user.findUnique({ where: { id: operatorId } });
    if (!operator || operator.role !== 'STAF') {
      throw new BadRequestException('Operator tidak valid atau bukan staf');
    }

    return await this.prisma.produksiAssign.create({
      data: {
        orderId,
        operatorId,
        tarifPerPcs,
      },
    });
  }

  // API Khusus untuk Tampilan Mobile Staf (Fokus 1 tugas)
  async getMobileTasks(operatorId: number) {
    const assignments = await this.prisma.produksiAssign.findMany({
      where: { operatorId },
      include: {
        order: {
          include: { items: true },
        },
      },
      orderBy: { tanggalAssign: 'desc' },
    });

    if (assignments.length === 0) {
      return {
        activeTask: null,
        queue: [],
      };
    }

    // Ambil tugas paling pertama yang belum selesai (berdasarkan urutan assign)
    const activeTask = assignments[0];
    const queue = assignments.slice(1).map((a) => ({
      id: a.id,
      noOrder: a.order.noOrder,
    }));

    return {
      activeTask: {
        id: activeTask.id,
        noOrder: activeTask.order.noOrder,
        tarifPerPcs: activeTask.tarifPerPcs,
        items: activeTask.order.items,
      },
      queue, // Antrean berikutnya
    };
  }

  async submitOutput(assignId: number, pcsKlaim: number) {
    return await this.prisma.produksiOutput.create({
      data: {
        assignId,
        pcsKlaim,
        status: 'MENUNGGU_APPROVAL',
      },
    });
  }
}
