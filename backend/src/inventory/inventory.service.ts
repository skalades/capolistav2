import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { KategoriBahan, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAllBahan() {
    return this.prisma.stokBahan.findMany({
      orderBy: { namaBahan: 'asc' },
    });
  }

  async findBahanById(id: number) {
    const bahan = await this.prisma.stokBahan.findUnique({
      where: { id },
    });
    if (!bahan) throw new NotFoundException('Bahan tidak ditemukan');
    return bahan;
  }

  async createBahan(data: Prisma.StokBahanCreateInput) {
    return this.prisma.stokBahan.create({
      data,
    });
  }

  async updateBahan(id: number, data: Prisma.StokBahanUpdateInput) {
    await this.findBahanById(id);
    return this.prisma.stokBahan.update({
      where: { id },
      data,
    });
  }

  async deleteBahan(id: number) {
    await this.findBahanById(id);
    return this.prisma.stokBahan.delete({
      where: { id },
    });
  }

  async catatOpname(data: { bahanId: number; stokFisik: number; catatan?: string }) {
    const bahan = await this.findBahanById(data.bahanId);
    
    // Konversi stokSistem dan stokFisik ke angka untuk perbandingan dan perhitungan
    const stokSistem = Number(bahan.stok);
    const stokFisik = data.stokFisik;
    const selisih = stokFisik - stokSistem;

    const opname = await this.prisma.stokOpname.create({
      data: {
        bahanId: data.bahanId,
        stokSistem: stokSistem,
        stokFisik: stokFisik,
        selisih: selisih,
        catatan: data.catatan,
      },
    });

    // Update stok aktual di StokBahan
    await this.prisma.stokBahan.update({
      where: { id: data.bahanId },
      data: { stok: stokFisik },
    });

    return opname;
  }

  async getHistoryOpname(bahanId?: number) {
    return this.prisma.stokOpname.findMany({
      where: bahanId ? { bahanId } : undefined,
      include: { bahan: true },
      orderBy: { tanggal: 'desc' },
    });
  }
}
