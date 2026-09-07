import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { HrService } from './hr.service.js';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('assign-operator')
  async assign(
    @Body() body: { orderId: number; operatorId: number; tarifPerPcs: number },
  ) {
    return await this.hrService.assignOperator(
      body.orderId,
      body.operatorId,
      body.tarifPerPcs,
    );
  }

  @Get('mobile-tasks/:operatorId')
  async getMobileTasks(@Param('operatorId') operatorId: string) {
    return await this.hrService.getMobileTasks(Number(operatorId));
  }

  @Post('submit-output')
  async submitOutput(@Body() body: { assignId: number; pcsKlaim: number }) {
    return await this.hrService.submitOutput(body.assignId, body.pcsKlaim);
  }

  // =====================
  // ABSENSI
  // =====================
  @Post('absensi')
  async createAbsensi(
    @Body()
    body: {
      userId: number;
      tanggal: string;
      status: any;
      jamMasuk?: string;
      jamKeluar?: string;
    },
  ) {
    return await this.hrService.createAbsensi(body);
  }

  @Get('absensi')
  async getAbsensi() {
    return await this.hrService.getAbsensi();
  }

  // =====================
  // PENGGAJIAN
  // =====================
  @Post('penggajian/generate')
  async generatePenggajian(
    @Body()
    body: {
      userId: number;
      periodeBulan: number;
      periodeTahun: number;
    },
  ) {
    return await this.hrService.generatePenggajian(
      body.userId,
      body.periodeBulan,
      body.periodeTahun,
    );
  }

  @Get('penggajian')
  async getPenggajian() {
    return await this.hrService.getPenggajian();
  }

  @Get('penggajian/:id')
  async getPenggajianById(@Param('id') id: string) {
    return await this.hrService.getPenggajianById(Number(id));
  }

  @Put('penggajian/:id')
  async updatePenggajian(
    @Param('id') id: string,
    @Body() body: { totalGaji?: number; status?: any },
  ) {
    return await this.hrService.updatePenggajian(Number(id), body);
  }

  @Delete('penggajian/:id')
  async deletePenggajian(@Param('id') id: string) {
    return await this.hrService.deletePenggajian(Number(id));
  }

  // =====================
  // TARIF BORONGAN HISTORY
  // =====================
  @Get('tarif-borongan-history')
  async getTarifBoronganHistory() {
    return await this.hrService.getTarifBoronganHistory();
  }

  @Get('tarif-borongan-history/:userId')
  async getTarifBoronganHistoryByUser(@Param('userId') userId: string) {
    return await this.hrService.getTarifBoronganHistory(Number(userId));
  }
}
