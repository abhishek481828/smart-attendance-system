import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('classes')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER)
export class ClassController {
  constructor(private classService: ClassService) {}

  @Post()
  create(@Body() createClassDto: CreateClassDto, @Request() req) {
    return this.classService.create(createClassDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.classService.findByTeacher(req.user.sub);
  }
}
