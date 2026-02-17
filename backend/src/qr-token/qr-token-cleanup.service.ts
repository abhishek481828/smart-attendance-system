import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QrToken } from '../entities/qr-token.entity';

@Injectable()
export class QrTokenCleanupService {
  constructor(
    @InjectRepository(QrToken)
    private readonly qrTokenRepository: Repository<QrToken>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupExpiredTokens() {
    const result = await this.qrTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    if (result.affected && result.affected > 0) {
      console.log(`Deleted ${result.affected} expired QR tokens`);
    }
  }
}
