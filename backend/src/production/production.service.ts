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

  // Alur produksi baku Capolista:
  // DRAFT → DESAIN → PROCUREMENT → PRINTING → PEMASANGAN → CUTTING → JAHIT → PACKING → DIKIRIM → GUDANG → SELESAI
  private readonly alurProduksi: StatusOrder[] = [
    StatusOrder.DRAFT,
    StatusOrder.DESAIN,
    StatusOrder.PROCUREMENT,
    StatusOrder.PRINTING,
    StatusOrder.PEMASANGAN,
    StatusOrder.CUTTING,
    StatusOrder.JAHIT,
    StatusOrder.PACKING,
    StatusOrder.DIKIRIM,
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
        assignments: {
          include: { operator: true }
        }
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

    // Logika: Jika dari DESAIN dan bahan sudah ada (skipProcurement = true via skipPrinting flag),
    // langsung ke PRINTING tanpa harus ke PROCUREMENT
    if (order.status === StatusOrder.DESAIN && skipPrinting) {
      nextStatus = StatusOrder.PRINTING;
    }

    // Logika: Jika dari JAHIT dan produk tidak perlu QC lebih (langsung ke PACKING)
    // Default tetap ke PACKING sesuai alur

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus, subStatus: null },
    });

    // Catat ke OrderLog untuk audit trail
    await this.prisma.orderLog.create({
      data: {
        orderId,
        type: 'STATUS_CHANGE',
        title: `Status diperbarui ke ${nextStatus}`,
        desc: `Dipindahkan dari ${order.status} → ${nextStatus}`,
      },
    });

    return {
      message: `Order berhasil dipindahkan dari ${order.status} ke ${nextStatus}`,
      order: updatedOrder,
    };
  }


  async updateSubStatus(orderId: number, subStatus: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { subStatus },
    });

    return {
      message: `Sub status order berhasil diperbarui menjadi ${subStatus}`,
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

  // --- Modul Desain ---

  async getDesainByOrderId(orderId: number) {
    let desain = await this.prisma.desain.findFirst({
      where: { orderId },
      orderBy: { versi: 'desc' }
    });
    
    if (!desain) {
      // Auto-create initial desain if not exists
      desain = await this.prisma.desain.create({
        data: {
          orderId,
          versi: 1,
          statusApproval: 'MENUNGGU'
        }
      });
    }
    return desain;
  }

  async updateDesain(orderId: number, data: { fileMockup?: string, filePola?: string, catatanInstruksiCutting?: string }) {
    const current = await this.getDesainByOrderId(orderId);
    
    return this.prisma.desain.update({
      where: { id: current.id },
      data: {
        fileMockup: data.fileMockup ?? current.fileMockup,
        filePola: data.filePola ?? current.filePola,
        catatanInstruksiCutting: data.catatanInstruksiCutting ?? current.catatanInstruksiCutting,
        versi: current.versi + 1, // Auto increment versi jika ada update
        statusApproval: 'MENUNGGU' // Reset status
      }
    });
  }

  async approveDesain(orderId: number, status: 'DISETUJUI' | 'DITOLAK') {
    const current = await this.getDesainByOrderId(orderId);
    
    return this.prisma.desain.update({
      where: { id: current.id },
      data: { statusApproval: status }
    });
  }

  // --- Modul Cutting ---

  async getCuttingByOrderId(orderId: number) {
    let cutting = await this.prisma.produksiCutting.findFirst({
      where: { orderId },
      include: { operator: { select: { nama: true } } }
    });

    if (!cutting) {
      cutting = await this.prisma.produksiCutting.create({
        data: {
          orderId,
          status: 'BELUM_MULAI'
        },
        include: { operator: { select: { nama: true } } }
      });
    }

    // Ambil juga instruksi dari divisi desain
    const desain = await this.prisma.desain.findFirst({
      where: { orderId },
      orderBy: { versi: 'desc' },
      select: { catatanInstruksiCutting: true, filePola: true }
    });

    return { ...cutting, desainInfo: desain };
  }

  async updateCutting(orderId: number, data: { operatorId?: number, pcsPerUkuran?: any, status?: any, statusQc?: any, catatan?: string }) {
    const current = await this.prisma.produksiCutting.findFirst({ where: { orderId } });
    if (!current) throw new NotFoundException('Data cutting tidak ditemukan');

    const updateData: any = {
      operatorId: data.operatorId !== undefined ? data.operatorId : current.operatorId,
      pcsPerUkuran: data.pcsPerUkuran !== undefined ? data.pcsPerUkuran : current.pcsPerUkuran,
      status: data.status !== undefined ? data.status : current.status,
      statusQc: data.statusQc !== undefined ? data.statusQc : current.statusQc,
      catatan: data.catatan !== undefined ? data.catatan : current.catatan,
    };

    if (data.status === 'PROSES' && current.status === 'BELUM_MULAI') {
      updateData.tanggalMulai = new Date();
    } else if (data.status === 'SELESAI' && current.status !== 'SELESAI') {
      updateData.tanggalSelesai = new Date();
    }

    return this.prisma.produksiCutting.update({
      where: { id: current.id },
      data: updateData,
      include: { operator: { select: { nama: true } } }
    });
  }

  // --- Modul Printing ---

  async getPrintingByOrderId(orderId: number) {
    let printing = await this.prisma.produksiPrinting.findFirst({ where: { orderId } });
    if (!printing) {
      printing = await this.prisma.produksiPrinting.create({
        data: { orderId, status: 'BELUM_MULAI' }
      });
    }
    return printing;
  }

  async updatePrinting(orderId: number, data: { metodeCetak?: string, status?: any, statusQc?: any }) {
    const current = await this.prisma.produksiPrinting.findFirst({ where: { orderId } });
    if (!current) throw new NotFoundException('Data printing tidak ditemukan');

    const updateData: any = {
      metodeCetak: data.metodeCetak !== undefined ? data.metodeCetak : current.metodeCetak,
      status: data.status !== undefined ? data.status : current.status,
      statusQc: data.statusQc !== undefined ? data.statusQc : current.statusQc,
    };

    if (data.status === 'PROSES' && current.status === 'BELUM_MULAI') {
      updateData.tanggalMulai = new Date();
    } else if (data.status === 'SELESAI' && current.status !== 'SELESAI') {
      updateData.tanggalSelesai = new Date();
    }

    return this.prisma.produksiPrinting.update({ where: { id: current.id }, data: updateData });
  }

  // --- Modul Pemasangan / Finishing ---

  async getPemasanganByOrderId(orderId: number) {
    let pemasangan = await this.prisma.produksiPemasangan.findFirst({ where: { orderId } });
    if (!pemasangan) {
      pemasangan = await this.prisma.produksiPemasangan.create({
        data: { orderId, status: 'BELUM_MULAI' }
      });
    }
    return pemasangan;
  }

  async updatePemasangan(orderId: number, data: { parameterProses?: string, status?: any, statusQc?: any }) {
    const current = await this.prisma.produksiPemasangan.findFirst({ where: { orderId } });
    if (!current) throw new NotFoundException('Data pemasangan tidak ditemukan');

    const updateData: any = {
      parameterProses: data.parameterProses !== undefined ? data.parameterProses : current.parameterProses,
      status: data.status !== undefined ? data.status : current.status,
      statusQc: data.statusQc !== undefined ? data.statusQc : current.statusQc,
    };

    if (data.status === 'PROSES' && current.status === 'BELUM_MULAI') {
      updateData.tanggalMulai = new Date();
    } else if (data.status === 'SELESAI' && current.status !== 'SELESAI') {
      updateData.tanggalSelesai = new Date();
    }

    return this.prisma.produksiPemasangan.update({ where: { id: current.id }, data: updateData });
  }
}



