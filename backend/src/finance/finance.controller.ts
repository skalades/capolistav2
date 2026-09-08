import { Controller, Get, Post, Body } from '@nestjs/common';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  getSummary() {
    return this.financeService.getSummary();
  }

  @Get('payments')
  findAllPayments() {
    return this.financeService.findAllPayments();
  }

  @Post('payments')
  createPayment(@Body() createPaymentDto: any) {
    return this.financeService.createPayment(createPaymentDto);
  }

  @Get('pengeluaran')
  findAllPengeluaran() {
    return this.financeService.findAllPengeluaran();
  }

  @Post('pengeluaran')
  createPengeluaran(@Body() data: any) {
    return this.financeService.createPengeluaran(data);
  }
}
