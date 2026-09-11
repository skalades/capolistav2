import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('owner')
  getOwnerDashboard() {
    return this.dashboardService.getOwnerDashboard();
  }

  @Get('divisi')
  getDivisiDashboard(@Request() req: any) {
    return this.dashboardService.getDivisiDashboard(req.user.divisi);
  }

  @Get('staf')
  getStafDashboard(@Request() req: any) {
    return this.dashboardService.getStafDashboard(req.user.id);
  }
}
