import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto, teacherId: string) {
    const classEntity = this.classRepository.create({
      name: createClassDto.name,
      teacher: { id: teacherId },
    });

    return this.classRepository.save(classEntity);
  }

  async findByTeacher(teacherId: string) {
    return this.classRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['teacher'],
    });
  }
}
