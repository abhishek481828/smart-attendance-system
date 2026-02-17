import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { QrTokenService } from '../qr-token/qr-token.service';

@Controller('sessions')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER)
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private qrTokenService: QrTokenService,
  ) {}

  @Post('start')
  startSession(@Body() startSessionDto: StartSessionDto) {
    return this.sessionService.startSession(startSessionDto);
  }

  @Post('end')
  endSession(@Body() endSessionDto: EndSessionDto) {
    return this.sessionService.endSession(endSessionDto);
  }

  @Get(':id/qr')
  generateQrToken(@Param('id') id: string) {
    return this.qrTokenService.generateToken(id);
  }
}
