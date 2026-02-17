import { IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  classId: string;
}
