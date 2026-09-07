import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { HrService } from './hr.service.js';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('assign-operator')
  async assign(@Body() body: { orderId: number; operatorId: number; tarifPerPcs: number }) {
    return await this.hrService.assignOperator(body.orderId, body.operatorId, body.tarifPerPcs);
  }

  @Get('mobile-tasks/:operatorId')
  async getMobileTasks(@Param('operatorId') operatorId: string) {
    return await this.hrService.getMobileTasks(Number(operatorId));
  }

  @Post('submit-output')
  async submitOutput(@Body() body: { assignId: number; pcsKlaim: number }) {
    return await this.hrService.submitOutput(body.assignId, body.pcsKlaim);
  }
}
