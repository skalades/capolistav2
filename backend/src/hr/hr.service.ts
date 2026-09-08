import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getOperators(divisi: any) {
    return await this.prisma.user.findMany({
      where: {
        divisi: divisi,
        role: 'STAF'
      },
      select: {
        id: true,
        nama: true,
        tarifDefault: true
      }
    });
  }

  async assignOperator(
    orderId: number,
    operatorId: number,
    tarifPerPcs: number,
  ) {
    // Pastikan order dan operator valid
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const operator = await this.prisma.user.findUnique({
      where: { id: operatorId },
    });
    if (!operator || operator.role !== 'STAF') {
      throw new BadRequestException('Operator tidak valid atau bukan staf');
    }

    const existingAssign = await this.prisma.produksiAssign.findFirst({
      where: {
        orderId,
        operatorId,
      }
    });

    if (existingAssign) {
      return await this.prisma.produksiAssign.update({
        where: { id: existingAssign.id },
        data: { tarifPerPcs }
      });
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

  async getPendingApprovals() {
    return await this.prisma.produksiOutput.findMany({
      where: { status: 'MENUNGGU_APPROVAL' },
      include: {
        assign: {
          include: {
            order: true,
            operator: true,
          }
        }
      },
      orderBy: { tanggalKlaim: 'asc' }
    });
  }

  async approveOutput(id: number, status: 'APPROVED' | 'REJECTED', pcsApproved: number, catatanMandor?: string) {
    return await this.prisma.produksiOutput.update({
      where: { id },
      data: {
        status,
        pcsApproved: status === 'APPROVED' ? pcsApproved : 0,
        catatanMandor,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      }
    });
  }

  // =====================
  // ABSENSI
  // =====================
  async createAbsensi(data: {
    userId: number;
    tanggal: string;
    status: any;
    jamMasuk?: string;
    jamKeluar?: string;
  }) {
    return await this.prisma.absensi.create({
      data: {
        userId: data.userId,
        tanggal: new Date(data.tanggal),
        status: data.status,
        jamMasuk: data.jamMasuk ? new Date(data.jamMasuk) : null,
        jamKeluar: data.jamKeluar ? new Date(data.jamKeluar) : null,
      },
    });
  }

  async getAbsensi() {
    return await this.prisma.absensi.findMany({
      include: { user: true },
      orderBy: { tanggal: 'desc' },
    });
  }

  // =====================
  // PENGGAJIAN
  // =====================
  async generatePenggajian(
    userId: number,
    periodeBulan: number,
    periodeTahun: number,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    let totalGaji = 0;

    if (user.tipeGaji === 'BORONGAN') {
      const outputs = await this.prisma.produksiOutput.findMany({
        where: {
          assign: { operatorId: userId },
          status: 'APPROVED',
          approvedAt: {
            gte: new Date(periodeTahun, periodeBulan - 1, 1),
            lt: new Date(periodeTahun, periodeBulan, 1),
          },
        },
        include: { assign: true },
      });

      totalGaji = outputs.reduce((sum, out) => {
        return sum + out.pcsApproved * Number(out.assign.tarifPerPcs);
      }, 0);
    } else {
      totalGaji = Number(user.tarifDefault || 0);
    }

    return await this.prisma.penggajian.create({
      data: {
        userId,
        periodeBulan,
        periodeTahun,
        totalGaji,
        status: 'DRAFT',
      },
    });
  }

  async getPenggajian() {
    return await this.prisma.penggajian.findMany({
      include: { user: true },
      orderBy: [{ periodeTahun: 'desc' }, { periodeBulan: 'desc' }],
    });
  }

  async getPenggajianById(id: number) {
    const p = await this.prisma.penggajian.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!p) throw new NotFoundException('Penggajian tidak ditemukan');
    return p;
  }

  async updatePenggajian(
    id: number,
    data: { totalGaji?: number; status?: any },
  ) {
    return await this.prisma.penggajian.update({
      where: { id },
      data,
    });
  }

  async deletePenggajian(id: number) {
    return await this.prisma.penggajian.delete({ where: { id } });
  }

  // =====================
  // TARIF BORONGAN HISTORY
  // =====================
  async getTarifBoronganHistory(userId?: number) {
    const whereClause = userId ? { userId } : {};
    return await this.prisma.tarifBoronganHistory.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { tanggalEfektif: 'desc' },
    });
  }
}
