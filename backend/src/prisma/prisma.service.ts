import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error(
        `❌ Database connection failed: ${(error as Error).message}`,
      );
      this.logger.warn('Retrying in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
