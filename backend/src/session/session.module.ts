import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionCleanupService } from './session-cleanup.service';
import { QrTokenService } from '../qr-token/qr-token.service';
import { QrTokenCleanupService } from '../qr-token/qr-token-cleanup.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SessionController],
  providers: [SessionService, SessionCleanupService, QrTokenService, QrTokenCleanupService],
})
export class SessionModule {}
