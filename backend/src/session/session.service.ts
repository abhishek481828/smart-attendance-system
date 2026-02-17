import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async startSession(startSessionDto: StartSessionDto) {
    const activeSession = await this.sessionRepository.findOne({
      where: {
        class: { id: startSessionDto.classId },
        isActive: true,
      },
    });

    if (activeSession) {
      throw new BadRequestException('Class already has an active session');
    }

    const session = this.sessionRepository.create({
      class: { id: startSessionDto.classId },
      startTime: new Date(),
      isActive: true,
    });

    return this.sessionRepository.save(session);
  }

  async endSession(endSessionDto: EndSessionDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: endSessionDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    session.endTime = new Date();
    session.isActive = false;

    return this.sessionRepository.save(session);
  }
}
