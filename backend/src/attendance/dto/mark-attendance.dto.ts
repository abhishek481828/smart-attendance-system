import { IsUUID, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class MarkAttendanceDto {
  @IsUUID()
  sessionId: string;

  @IsString()
  token: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
