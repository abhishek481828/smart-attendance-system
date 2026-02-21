import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('attendance')
@UseGuards(RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(UserRole.STUDENT)
  markAttendance(@Body() markAttendanceDto: MarkAttendanceDto, @Request() req) {
    return this.attendanceService.markAttendance(
      markAttendanceDto, 
      req.user.sub
    );
  }

  @Get('session/:sessionId')
  @Roles(UserRole.TEACHER)
  getSessionAttendance(@Param('sessionId') sessionId: string, @Request() req) {
    return this.attendanceService.getSessionAttendance(sessionId, req.user.sub);
  }
}
