import { Module } from '@nestjs/common';
import { HrController } from './hr.controller.js';
import { HrService } from './hr.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HrController],
  providers: [HrService, PrismaService],
})
export class HrModule {}
