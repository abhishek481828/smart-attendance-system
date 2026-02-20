import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto, teacherId: string) {
    return this.prisma.class.create({
      data: {
        name: createClassDto.name,
        teacherId,
      },
    });
  }

  async findByTeacher(teacherId: string) {
    return this.prisma.class.findMany({
      where: { teacherId },
      include: { teacher: true },
    });
  }
}
