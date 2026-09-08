import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { StatusOrder } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto, createdById: number) {
    const {
      namaCustomer,
      kontakCustomer,
      alamatCustomer,
      deadline,
      totalHarga,
      dp,
      items,
    } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order harus memiliki minimal 1 item.');
    }

    const sisaBayar = totalHarga - dp;
    if (sisaBayar < 0) {
      throw new BadRequestException('DP tidak boleh melebihi Total Harga.');
    }

    // Gunakan Transaction agar jika gagal di item, order & customer tidak tersimpan sebagian
    return await this.prisma.$transaction(async (tx: any) => {
      // 1. Cari atau Buat Customer berdasarkan kontak/nama
      let customer;
      if (kontakCustomer) {
        customer = await tx.customer.findFirst({
          where: { kontak: kontakCustomer },
        });
      }
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            nama: namaCustomer,
            kontak: kontakCustomer,
            alamat: alamatCustomer,
          },
        });
      }

      // 2. Generate Nomor Order otomatis (ORD-YYYYMMDD-XXXX)
      const today = new Date();
      const dateString = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

      const countToday = await tx.order.count({
        where: {
          noOrder: {
            startsWith: `ORD-${dateString}`,
          },
        },
      });
      const sequence = String(countToday + 1).padStart(4, '0');
      const noOrder = `ORD-${dateString}-${sequence}`;

      // 3. Buat Order
      const newOrder = await tx.order.create({
        data: {
          noOrder,
          customerId: customer.id,
          deadline: deadline ? new Date(deadline) : null,
          totalHarga,
          dp,
          sisaBayar,
          createdById,
          status: 'DRAFT', // Sesuai enum StatusOrder di prisma
          items: {
            create: items.map((item: any) => ({
              jenisProduk: item.jenisProduk,
              ukuran: item.ukuran,
              jumlahPcs: item.jumlahPcs,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // 4. Buat OrderLog awal
      await tx.orderLog.create({
        data: {
          orderId: newOrder.id,
          userId: createdById,
          type: 'system',
          title: 'Order Dibuat',
          desc: 'Order baru ditambahkan ke sistem.',
        },
      });

      return newOrder;
    });
  }

  async findAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order: any) => ({
      id: order.id,
      noOrder: order.noOrder,
      customerName: order.customer.nama,
      statusPembayaran:
        order.sisaBayar <= 0 ? 'Lunas' : order.dp > 0 ? 'DP' : 'Belum Bayar',
      statusColor:
        order.sisaBayar <= 0 ? 'Teal' : order.dp > 0 ? 'Gold' : 'Red',
      statusProduksi: order.status,
      deadline: order.deadline,
    }));
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        logs: {
          include: {
            user: { select: { nama: true, divisi: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!order) {
      throw new BadRequestException('Order tidak ditemukan');
    }
    return order;
  }

  async trackOrderByNo(noOrder: string) {
    const order = await this.prisma.order.findUnique({
      where: { noOrder },
      include: {
        customer: { select: { nama: true } }, // hanya nama untuk privasi
        items: true,
        logs: {
          select: {
            id: true,
            type: true,
            title: true,
            desc: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!order) {
      throw new BadRequestException('Order tidak ditemukan');
    }
    
    // Sembunyikan informasi harga detail dari customer jika diperlukan, tapi totalHarga mungkin perlu.
    // Di sini kita return semua field utama order, items, logs, dan nama customer.
    return order;
  }

  async update(id: number, updateOrderDto: any) {
    const order = await this.findOne(id);
    const { items, ...orderData } = updateOrderDto;

    return await this.prisma.order.update({
      where: { id },
      data: {
        ...orderData,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { orderId: id } }),
      this.prisma.orderLog.deleteMany({ where: { orderId: id } }),
      this.prisma.order.delete({ where: { id } })
    ]);

    return { success: true };
  }

  async updateStatus(id: number, status: StatusOrder, catatan: string, userId: number) {
    return await this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderLog.create({
        data: {
          orderId: id,
          userId,
          type: 'system',
          title: `Status diubah ke ${status}`,
          desc: catatan || 'Status order diperbarui.',
        },
      });

      return order;
    });
  }

  async addChatLog(orderId: number, message: string, userId: number) {
    return await this.prisma.orderLog.create({
      data: {
        orderId,
        userId,
        type: 'chat',
        title: 'Komentar Baru',
        desc: message,
      },
      include: {
        user: { select: { nama: true, divisi: true } }
      }
    });
  }
}
