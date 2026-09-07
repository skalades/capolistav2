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
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  // @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.PEMASARAN)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    // Simulasi user ID untuk saat ini karena Auth belum sepenuhnya jadi
    const userId = req.user?.id || 1;
    return await this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get()
  async findAll() {
    return await this.ordersService.findAllOrders();
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
}
