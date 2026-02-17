import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '../entities/class.entity';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Class]), AuthModule],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
