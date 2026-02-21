import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto, studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: markAttendanceDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    const qrToken = await this.prisma.qrToken.findFirst({
      where: {
        sessionId: markAttendanceDto.sessionId,
        token: markAttendanceDto.token,
      },
    });

    if (!qrToken) {
      throw new BadRequestException('Invalid token');
    }

    if (new Date() > qrToken.expiresAt) {
      throw new BadRequestException('Token expired');
    }

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        sessionId: markAttendanceDto.sessionId,
        studentId,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Attendance already marked');
    }

    return this.prisma.attendance.create({
      data: {
        sessionId: markAttendanceDto.sessionId,
        studentId,
        markedAt: new Date(),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  async getSessionAttendance(sessionId: string, teacherId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.class.teacher.id !== teacherId) {
      throw new ForbiddenException('Session does not belong to teacher');
    }

    const attendance = await this.prisma.attendance.findMany({
      where: { sessionId },
      include: { student: true },
    });

    return attendance.map(record => ({
      studentId: record.student.id,
      studentEmail: record.student.email,
      markedAt: record.markedAt,
    }));
  }
}
