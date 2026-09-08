import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Post,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductionService } from './production.service.js';
import { StatusOrder } from '@prisma/client';
import { CreateAssignDto } from './dto/create-assign.dto.js';
import { UpdateAssignDto } from './dto/update-assign.dto.js';
import { CreateOutputDto } from './dto/create-output.dto.js';
import { UpdateOutputDto, ApproveOutputDto } from './dto/update-output.dto.js';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('board/:status')
  async getBoard(@Param('status') status: StatusOrder) {
    return await this.productionService.getKanbanBoard(status);
  }

  @Patch('order/:id/next-stage')
  async moveNext(
    @Param('id') id: string,
    @Body('skipPrinting') skipPrinting: boolean,
  ) {
    return await this.productionService.moveOrderToNextStage(
      Number(id),
      skipPrinting,
    );
  }

  @Patch('order/:id/substatus')
  async updateSubStatus(
    @Param('id') id: string,
    @Body('subStatus') subStatus: string,
  ) {
    return await this.productionService.updateSubStatus(Number(id), subStatus);
  }

  // --- Produksi Assign (Assignment Jahitan/Lainnya) ---

  @Post('assign')
  async createAssign(@Body() createAssignDto: CreateAssignDto) {
    return this.productionService.createAssign(createAssignDto);
  }

  @Get('assign')
  async getAssigns() {
    return this.productionService.getAssigns();
  }

  @Get('assign/:id')
  async getAssignById(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.getAssignById(id);
  }

  @Put('assign/:id')
  async updateAssign(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignDto: UpdateAssignDto,
  ) {
    return this.productionService.updateAssign(id, updateAssignDto);
  }

  @Delete('assign/:id')
  async deleteAssign(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.deleteAssign(id);
  }

  // --- Produksi Output (Self-Report & Approval) ---

  @Post('output')
  async createOutput(@Body() createOutputDto: CreateOutputDto) {
    return this.productionService.createOutput(createOutputDto);
  }

  @Get('output')
  async getOutputs() {
    return this.productionService.getOutputs();
  }

  @Get('output/:id')
  async getOutputById(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.getOutputById(id);
  }

  @Put('output/:id')
  async updateOutput(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOutputDto: UpdateOutputDto,
  ) {
    return this.productionService.updateOutput(id, updateOutputDto);
  }

  @Delete('output/:id')
  async deleteOutput(@Param('id', ParseIntPipe) id: number) {
    return this.productionService.deleteOutput(id);
  }

  @Patch('output/:id/approve')
  async approveOutput(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveOutputDto: ApproveOutputDto,
  ) {
    return this.productionService.approveOutput(id, approveOutputDto);
  }

  // --- Modul Desain ---

  @Get('desain/:orderId')
  async getDesainByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.productionService.getDesainByOrderId(orderId);
  }

  @Post('desain/:orderId')
  async updateDesain(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { fileMockup?: string, filePola?: string, catatanInstruksiCutting?: string }
  ) {
    return this.productionService.updateDesain(orderId, body);
  }

  @Patch('desain/:orderId/approve')
  async approveDesain(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('status') status: 'DISETUJUI' | 'DITOLAK'
  ) {
    return this.productionService.approveDesain(orderId, status);
  }

  // --- Modul Cutting ---

  @Get('cutting/:orderId')
  async getCuttingByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.productionService.getCuttingByOrderId(orderId);
  }

  @Post('cutting/:orderId')
  async updateCutting(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { operatorId?: number, pcsPerUkuran?: any, status?: any, statusQc?: any, catatan?: string }
  ) {
    return this.productionService.updateCutting(orderId, body);
  }

  // --- Modul Printing ---

  @Get('printing/:orderId')
  async getPrintingByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.productionService.getPrintingByOrderId(orderId);
  }

  @Post('printing/:orderId')
  async updatePrinting(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { metodeCetak?: string, status?: any, statusQc?: any }
  ) {
    return this.productionService.updatePrinting(orderId, body);
  }

  // --- Modul Pemasangan / Finishing ---

  @Get('pemasangan/:orderId')
  async getPemasanganByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.productionService.getPemasanganByOrderId(orderId);
  }

  @Post('pemasangan/:orderId')
  async updatePemasangan(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { parameterProses?: string, status?: any, statusQc?: any }
  ) {
    return this.productionService.updatePemasangan(orderId, body);
  }
}



