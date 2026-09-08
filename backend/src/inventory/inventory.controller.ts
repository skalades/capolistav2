import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { Prisma } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('bahan')
  async getAllBahan() {
    return this.inventoryService.findAllBahan();
  }

  @Get('bahan/:id')
  async getBahanById(@Param('id') id: string) {
    return this.inventoryService.findBahanById(+id);
  }

  @Post('bahan')
  async createBahan(@Body() data: Prisma.StokBahanCreateInput) {
    return this.inventoryService.createBahan(data);
  }

  @Put('bahan/:id')
  async updateBahan(@Param('id') id: string, @Body() data: Prisma.StokBahanUpdateInput) {
    return this.inventoryService.updateBahan(+id, data);
  }

  @Delete('bahan/:id')
  async deleteBahan(@Param('id') id: string) {
    return this.inventoryService.deleteBahan(+id);
  }

  @Post('opname')
  async catatOpname(@Body() data: { bahanId: number; stokFisik: number; catatan?: string }) {
    return this.inventoryService.catatOpname(data);
  }

  @Get('opname/history')
  async getHistoryOpname(@Query('bahanId') bahanId?: string) {
    return this.inventoryService.getHistoryOpname(bahanId ? +bahanId : undefined);
  }
}
