import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOrder } from '@prisma/client';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  // Daftar urutan alur produksi baku
  private readonly alurProduksi: StatusOrder[] = [
    StatusOrder.DRAFT,
    StatusOrder.DESAIN,
    StatusOrder.CUTTING,
    StatusOrder.JAHIT,
    StatusOrder.PRINTING,
    StatusOrder.PEMASANGAN,
    StatusOrder.GUDANG,
    StatusOrder.SELESAI,
  ];

  async getKanbanBoard(divisiStatus: StatusOrder) {
    // Menampilkan order yang berada di status divisi tersebut
    return await this.prisma.order.findMany({
      where: { status: divisiStatus },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { deadline: 'asc' }, // Prioritas berdasarkan deadline terdekat
    });
  }

  async moveOrderToNextStage(orderId: number, skipPrinting: boolean = false) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const currentIndex = this.alurProduksi.indexOf(order.status);
    
    if (currentIndex === -1 || currentIndex === this.alurProduksi.length - 1) {
      throw new BadRequestException('Order sudah selesai atau status tidak valid');
    }

    let nextIndex = currentIndex + 1;
    let nextStatus = this.alurProduksi[nextIndex];

    // Logika Cerdas: Jika dari Jahit, dan skipPrinting = true (misal polos), langsung ke Pemasangan
    if (order.status === StatusOrder.JAHIT && skipPrinting) {
      nextStatus = StatusOrder.PEMASANGAN;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    return {
      message: `Order berhasil dipindahkan dari ${order.status} ke ${nextStatus}`,
      order: updatedOrder,
    };
  }
}
