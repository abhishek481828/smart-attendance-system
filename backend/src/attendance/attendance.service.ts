import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  // Fixed classroom location (temporary)
  private readonly CLASSROOM_LAT = 16.464420;
  private readonly CLASSROOM_LNG = 80.507680;
  private readonly ALLOWED_RADIUS_METERS = 50;

  constructor(private prisma: PrismaService) {}

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async markAttendance(markAttendanceDto: MarkAttendanceDto, studentId: string, deviceId?: string) {
    // Validate device binding for students
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.deviceId && deviceId !== student.deviceId) {
      throw new ForbiddenException('Access denied: Unregistered device');
    }

    // Validate location
    const distance = this.calculateDistance(
      markAttendanceDto.latitude,
      markAttendanceDto.longitude,
      this.CLASSROOM_LAT,
      this.CLASSROOM_LNG
    );

    if (distance > this.ALLOWED_RADIUS_METERS) {
      throw new ForbiddenException('Access denied: Outside classroom range');
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
