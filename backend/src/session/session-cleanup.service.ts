import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredSessions() {
    const sixtyMinutesAgo = new Date();
    sixtyMinutesAgo.setMinutes(sixtyMinutesAgo.getMinutes() - 60);

    const now = new Date();

    await this.prisma.session.updateMany({
      where: {
        isActive: true,
        startTime: {
          lt: sixtyMinutesAgo,
        },
      },
      data: {
        isActive: false,
        endTime: now,
      },
    });
  }
}
