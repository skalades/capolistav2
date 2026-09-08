import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming there is a prisma service
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.systemSetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await this.prisma.systemSetting.create({
        data: { id: 1 },
      });
    }
    return settings;
  }

  async updateSettings(updateSettingDto: UpdateSettingDto) {
    // Upsert to make sure it always exists
    return this.prisma.systemSetting.upsert({
      where: { id: 1 },
      update: updateSettingDto,
      create: {
        id: 1,
        ...updateSettingDto,
      },
    });
  }
}
