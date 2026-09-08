import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ProductionModule } from './production/production.module.js';
import { HrModule } from './hr/hr.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { FinanceModule } from './finance/finance.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule, UsersModule, OrdersModule, ProductionModule, HrModule, InventoryModule, FinanceModule, SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
