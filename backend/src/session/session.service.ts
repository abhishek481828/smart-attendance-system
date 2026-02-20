import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async startSession(startSessionDto: StartSessionDto) {
    const activeSession = await this.prisma.session.findFirst({
      where: {
        classId: startSessionDto.classId,
        isActive: true,
      },
    });

    if (activeSession) {
      throw new BadRequestException('Class already has an active session');
    }

    return this.prisma.session.create({
      data: {
        classId: startSessionDto.classId,
        startTime: new Date(),
        isActive: true,
      },
    });
  }

  async endSession(endSessionDto: EndSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: endSessionDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    return this.prisma.session.update({
      where: { id: endSessionDto.sessionId },
      data: {
        endTime: new Date(),
        isActive: false,
      },
    });
  }
}
