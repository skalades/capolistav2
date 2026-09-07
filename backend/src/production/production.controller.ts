import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ProductionService } from './production.service.js';
import { StatusOrder } from '@prisma/client';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('board/:status')
  async getBoard(@Param('status') status: StatusOrder) {
    return await this.productionService.getKanbanBoard(status);
  }

  @Patch(':id/next-stage')
  async moveNext(@Param('id') id: string, @Body('skipPrinting') skipPrinting: boolean) {
    return await this.productionService.moveOrderToNextStage(Number(id), skipPrinting);
  }
}
