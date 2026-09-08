import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersPdfService } from './orders-pdf.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { StatusOrder } from '@prisma/client';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersPdfService: OrdersPdfService,
  ) {}

  @Post()
  // @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.PEMASARAN)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.id || null;
    return await this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get()
  async findAll() {
    return await this.ordersService.findAllOrders();
  }

  @Get('track/:noOrder')
  async trackOrder(@Param('noOrder') noOrder: string) {
    return await this.ordersService.trackOrderByNo(noOrder);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ordersService.remove(+id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: StatusOrder,
    @Body('catatan') catatan: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || null;
    return await this.ordersService.updateStatus(+id, status, catatan, userId);
  }

  @Post(':id/logs')
  async addLog(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || null;
    return await this.ordersService.addChatLog(+id, message, userId);
  }

  @Get(':id/invoice')
  async downloadInvoice(@Param('id') id: string, @Res() res: any) {
    return await this.ordersPdfService.generateInvoice(+id, res);
  }

  @Get(':id/receipt')
  async downloadReceipt(
    @Param('id') id: string, 
    @Query('paymentId') paymentId: string, 
    @Res() res: any
  ) {
    return await this.ordersPdfService.generateReceipt(+id, res, paymentId ? +paymentId : undefined);
  }
}


