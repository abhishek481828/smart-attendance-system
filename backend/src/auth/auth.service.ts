import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Device binding for students only
    if (user.role === 'STUDENT') {
      if (!user.deviceId && loginDto.deviceId) {
        // First login: bind device
        user.deviceId = loginDto.deviceId;
        await this.userRepository.save(user);
      } else if (user.deviceId && loginDto.deviceId !== user.deviceId) {
        // Device mismatch: deny access
        throw new UnauthorizedException('Access denied: Unregistered device');
      }
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      deviceId: user.deviceId 
    };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
