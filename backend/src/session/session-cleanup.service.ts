import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionCleanupService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredSessions() {
    const sixtyMinutesAgo = new Date();
    sixtyMinutesAgo.setMinutes(sixtyMinutesAgo.getMinutes() - 60);

    const expiredSessions = await this.sessionRepository.find({
      where: {
        isActive: true,
        startTime: LessThan(sixtyMinutesAgo),
      },
    });

    if (expiredSessions.length > 0) {
      const now = new Date();
      
      for (const session of expiredSessions) {
        session.isActive = false;
        session.endTime = now;
      }

      await this.sessionRepository.save(expiredSessions);
    }
  }
}
