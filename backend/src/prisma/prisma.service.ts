import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  }

  async onModuleInit() {
    try {
      console.log('Attempting to connect to database...');
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Full error:', error);
      // Don't throw - let the app start and retry later
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
