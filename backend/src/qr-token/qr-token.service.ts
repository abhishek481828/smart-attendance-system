import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class QrTokenService {
  constructor(private prisma: PrismaService) {}

  async generateToken(sessionId: string) {
    const session = await this.prisma.session.findUnique({
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

    return this.prisma.qrToken.upsert({
      where: { sessionId },
      update: {
        token,
        expiresAt,
      },
      create: {
        sessionId,
        token,
        expiresAt,
      },
    });
  }
}
