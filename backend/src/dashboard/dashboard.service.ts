import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnerDashboard() {
    const ordersBelumLunas = await this.prisma.order.findMany({
      where: { sisaBayar: { gt: 0 } },
      select: { sisaBayar: true }
    });
    const totalPiutang = ordersBelumLunas.reduce((acc: number, order: any) => acc + Number(order.sisaBayar), 0);
    const orderBelumLunasCount = ordersBelumLunas.length;

    const orderAktif = await this.prisma.order.findMany({
      where: { status: { notIn: ['DRAFT', 'SELESAI'] } },
    });
    const totalAktif = orderAktif.length;
    const onTrackCount = orderAktif.filter((o: any) => !o.subStatus?.includes('TERTAHAN')).length;
    const progresPersen = totalAktif > 0 ? Math.round((onTrackCount / totalAktif) * 100) : 0;

    const menungguDpCount = await this.prisma.order.count({
      where: {
        OR: [
          { status: 'DRAFT' },
          { subStatus: 'MENUNGGU_DP' }
        ]
      }
    });

    const recentOrders = await this.prisma.order.findMany({
      where: { status: { notIn: ['SELESAI', 'DRAFT'] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { customer: true }
    });

    const notifications: string[] = [];
    
    const stokMenipis = await this.prisma.stokBahan.findMany({
      where: { stok: { lte: this.prisma.stokBahan.fields.minimumStok } }
    });
    stokMenipis.forEach((b: any) => {
      notifications.push(`Stok ${b.namaBahan} mendekati batas minimum (${b.stok} ${b.satuan}).`);
    });

    const tertahan = await this.prisma.order.findMany({
      where: { subStatus: { contains: 'TERTAHAN' }, status: { not: 'SELESAI' } }
    });
    tertahan.forEach((o: any) => {
      notifications.push(`Order ${o.noOrder} tertahan: ${o.subStatus}`);
    });

    return {
      totalPiutang,
      orderBelumLunasCount,
      progresPersen,
      onTrackCount,
      totalAktif,
      menungguDpCount,
      orderAktif: recentOrders.map((o: any) => ({
        id: o.noOrder,
        cust: o.customer.nama,
        status: o.subStatus || o.status,
        variant: o.subStatus?.includes('TERTAHAN') ? 'danger' : 'warning'
      })),
      notifications
    };
  }

  async getDivisiDashboard(divisiStr: string) {
    const divisi = divisiStr as any;
    
    const perluApproval = await this.prisma.produksiOutput.count({
      where: {
        status: 'MENUNGGU_APPROVAL',
        assign: { operator: { divisi } }
      }
    });

    const orderDikerjakan = await this.prisma.order.count({
      where: { status: divisi }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tim = await this.prisma.user.findMany({
      where: { divisi, role: 'STAF' },
      include: {
        assignments: {
          include: {
            outputs: {
              where: { tanggalKlaim: { gte: today } }
            }
          }
        }
      }
    });

    const timOutput = tim.map((user: any) => {
      let pcsSelesai = 0;
      user.assignments.forEach((a: any) => {
        a.outputs.forEach((o: any) => {
          pcsSelesai += Number(o.pcsApproved || 0);
        });
      });
      return {
        name: user.nama,
        output: `${pcsSelesai} pcs`,
        status: user.statusAktif ? 'Aktif' : 'Nonaktif',
        variant: user.statusAktif ? 'success' : 'danger'
      };
    });

    return {
      perluApproval,
      orderDikerjakan,
      tim: timOutput
    };
  }

  async getStafDashboard(userId: number) {
    const assignments = await this.prisma.produksiAssign.findMany({
      where: { 
        operatorId: userId,
        order: { status: { not: 'SELESAI' } }
      },
      orderBy: { id: 'asc' },
      include: { 
        order: { include: { items: true } },
        outputs: true
      }
    });

    const taskAktif = assignments[0] || null;
    const antrean = assignments.filter((a: any) => a.id !== taskAktif?.id);

    return {
      taskAktif: taskAktif ? {
        id: taskAktif.id,
        orderId: taskAktif.order.noOrder,
        judul: `Order ${taskAktif.order.noOrder} ${taskAktif.jenisProduk ? '- ' + taskAktif.jenisProduk : ''}`,
        targetPcs: taskAktif.order.items.reduce((sum: number, item: any) => sum + item.jumlahPcs, 0),
        pcsSelesai: taskAktif.outputs.reduce((sum: number, o: any) => sum + o.pcsApproved, 0),
      } : null,
      antrean: antrean.map((a: any) => ({
        id: a.id,
        orderId: a.order.noOrder,
        targetPcs: a.order.items.reduce((sum: number, item: any) => sum + item.jumlahPcs, 0)
      }))
    };
  }
}
