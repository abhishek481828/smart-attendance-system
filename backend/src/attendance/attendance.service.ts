import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { Session } from '../entities/session.entity';
import { QrToken } from '../entities/qr-token.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(QrToken)
    private qrTokenRepository: Repository<QrToken>,
  ) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto, studentId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: markAttendanceDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    const qrToken = await this.qrTokenRepository.findOne({
      where: {
        session: { id: markAttendanceDto.sessionId },
        token: markAttendanceDto.token,
      },
    });

    if (!qrToken) {
      throw new BadRequestException('Invalid token');
    }

    if (new Date() > qrToken.expiresAt) {
      throw new BadRequestException('Token expired');
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        session: { id: markAttendanceDto.sessionId },
        student: { id: studentId },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Attendance already marked');
    }

    const attendance = this.attendanceRepository.create({
      session: { id: markAttendanceDto.sessionId },
      student: { id: studentId },
      markedAt: new Date(),
      status: AttendanceStatus.PRESENT,
    });

    return this.attendanceRepository.save(attendance);
  }

  async getSessionAttendance(sessionId: string, teacherId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['class', 'class.teacher'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.class.teacher.id !== teacherId) {
      throw new ForbiddenException('Session does not belong to teacher');
    }

    const attendance = await this.attendanceRepository.find({
      where: { session: { id: sessionId } },
      relations: ['student'],
    });

    return attendance.map(record => ({
      studentId: record.student.id,
      studentEmail: record.student.email,
      markedAt: record.markedAt,
    }));
  }
}
