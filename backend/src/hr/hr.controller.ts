import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HrService } from './hr.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
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

  @Get('operators/:divisi')
  async getOperators(@Param('divisi') divisi: any) {
    return await this.hrService.getOperators(divisi);
  }

  @Get('mobile-tasks/:operatorId')
  async getMobileTasks(@Param('operatorId') operatorId: string) {
    return await this.hrService.getMobileTasks(Number(operatorId));
  }

  @Post('submit-output')
  async submitOutput(@Body() body: { assignId: number; pcsKlaim: number }) {
    return await this.hrService.submitOutput(body.assignId, body.pcsKlaim);
  }

  @Get('pending-approvals')
  async getPendingApprovals() {
    return await this.hrService.getPendingApprovals();
  }

  @Patch('approve-output/:id')
  async approveOutput(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; pcsApproved: number; catatanMandor?: string },
    @Request() req: any
  ) {
    return await this.hrService.approveOutput(Number(id), body.status, body.pcsApproved, body.catatanMandor);
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
      catatan?: string;
    },
    @Request() req: any
  ) {
    return await this.hrService.createAbsensi({ ...body, dicatatOlehId: req.user.id });
  }

  @Get('absensi')
  async getAbsensi(
    @Query('tanggal') tanggal?: string,
    @Query('bulan') bulan?: string,
    @Query('tahun') tahun?: string,
  ) {
    return await this.hrService.getAbsensi(tanggal, bulan ? Number(bulan) : undefined, tahun ? Number(tahun) : undefined);
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

  // =====================
  // KARYAWAN & BULK ABSENSI
  // =====================
  @Get('karyawan')
  async getKaryawan() {
    return await this.hrService.getKaryawan();
  }

  @Post('absensi/bulk')
  async createBulkAbsensi(
    @Body()
    body: {
      entries: Array<{ userId: number; tanggal: string; status: any; jamMasuk?: string; jamKeluar?: string; catatan?: string }>;
    },
    @Request() req: any
  ) {
    return await this.hrService.createBulkAbsensi({
      entries: body.entries,
      dicatatOlehId: req.user.id,
    });
  }

  @Get('absensi/rekap')
  async getRekapAbsensi(
    @Query('bulan') bulan: string,
    @Query('tahun') tahun: string,
  ) {
    return await this.hrService.getRekapAbsensi(Number(bulan), Number(tahun));
  }
}
