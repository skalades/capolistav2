import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOrder, StatusOutput } from '@prisma/client';
import { CreateAssignDto } from './dto/create-assign.dto.js';
import { UpdateAssignDto } from './dto/update-assign.dto.js';
import { CreateOutputDto } from './dto/create-output.dto.js';
import { UpdateOutputDto, ApproveOutputDto } from './dto/update-output.dto.js';

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
      throw new BadRequestException(
        'Order sudah selesai atau status tidak valid',
      );
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

  // --- Produksi Assign (Assignment Jahitan/Lainnya) ---

  async createAssign(data: CreateAssignDto) {
    return this.prisma.produksiAssign.create({
      data: {
        orderId: data.orderId,
        operatorId: data.operatorId,
        tarifPerPcs: data.tarifPerPcs,
        tanggalAssign: data.tanggalAssign
          ? new Date(data.tanggalAssign)
          : new Date(),
      },
    });
  }

  async getAssigns() {
    return this.prisma.produksiAssign.findMany({
      include: {
        order: true,
        operator: {
          select: { id: true, nama: true },
        },
      },
    });
  }

  async getAssignById(id: number) {
    const assign = await this.prisma.produksiAssign.findUnique({
      where: { id },
      include: {
        order: true,
        operator: { select: { id: true, nama: true } },
        outputs: true,
      },
    });
    if (!assign) throw new NotFoundException('Assignment tidak ditemukan');
    return assign;
  }

  async updateAssign(id: number, data: UpdateAssignDto) {
    await this.getAssignById(id);
    return this.prisma.produksiAssign.update({
      where: { id },
      data: {
        orderId: data.orderId,
        operatorId: data.operatorId,
        tarifPerPcs: data.tarifPerPcs,
        tanggalAssign: data.tanggalAssign
          ? new Date(data.tanggalAssign)
          : undefined,
      },
    });
  }

  async deleteAssign(id: number) {
    await this.getAssignById(id);
    return this.prisma.produksiAssign.delete({ where: { id } });
  }

  // --- Produksi Output (Self-Report & Approval) ---

  async createOutput(data: CreateOutputDto) {
    return this.prisma.produksiOutput.create({
      data: {
        assignId: data.assignId,
        pcsKlaim: data.pcsKlaim,
        catatanMandor: data.catatanMandor,
      },
    });
  }

  async getOutputs() {
    return this.prisma.produksiOutput.findMany({
      include: {
        assign: {
          include: {
            order: { select: { noOrder: true } },
            operator: { select: { id: true, nama: true } },
          },
        },
      },
    });
  }

  async getOutputById(id: number) {
    const output = await this.prisma.produksiOutput.findUnique({
      where: { id },
      include: {
        assign: {
          include: {
            order: { select: { noOrder: true } },
            operator: { select: { id: true, nama: true } },
          },
        },
      },
    });
    if (!output) throw new NotFoundException('Output claim tidak ditemukan');
    return output;
  }

  async updateOutput(id: number, data: UpdateOutputDto) {
    await this.getOutputById(id);
    return this.prisma.produksiOutput.update({
      where: { id },
      data: {
        pcsKlaim: data.pcsKlaim,
        catatanMandor: data.catatanMandor,
      },
    });
  }

  async deleteOutput(id: number) {
    await this.getOutputById(id);
    return this.prisma.produksiOutput.delete({ where: { id } });
  }

  async approveOutput(id: number, data: ApproveOutputDto) {
    const output = await this.getOutputById(id);
    return this.prisma.produksiOutput.update({
      where: { id },
      data: {
        pcsApproved: data.pcsApproved,
        status: data.status,
        catatanMandor: data.catatanMandor ?? output.catatanMandor,
        approvedAt: data.status === 'APPROVED' ? new Date() : null,
      },
    });
  }
}
