import { IsUUID, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @IsUUID()
  sessionId: string;

  @IsString()
  token: string;
}
