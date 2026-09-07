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
}
