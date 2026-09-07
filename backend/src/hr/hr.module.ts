import { Module } from '@nestjs/common';
import { HrController } from './hr.controller.js';
import { HrService } from './hr.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [HrController],
  providers: [HrService, PrismaService],
})
export class HrModule {}
