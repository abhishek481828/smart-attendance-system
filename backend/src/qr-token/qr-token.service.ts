import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrToken } from '../entities/qr-token.entity';
import { Session } from '../entities/session.entity';
import * as crypto from 'crypto';

@Injectable()
export class QrTokenService {
  constructor(
    @InjectRepository(QrToken)
    private qrTokenRepository: Repository<QrToken>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async generateToken(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5000);

    await this.qrTokenRepository.upsert(
      {
        session,
        token,
        expiresAt,
      },
      ['session'],
    );

    return this.qrTokenRepository.findOne({
      where: { session: { id: sessionId } },
    });
  }
}
