import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        divisi: true,
        levelAkses: true,
        tipeGaji: true,
        tarifDefault: true,
        statusAktif: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        divisi: true,
        levelAkses: true,
        tipeGaji: true,
        tarifDefault: true,
        statusAktif: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const { password, ...user } = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return user;
  }

  async update(id: number, data: any) {
    // Check if exists
    await this.findOne(id);

    if (data.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    let updateData = { ...data };
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const { password, ...user } = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return user;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
