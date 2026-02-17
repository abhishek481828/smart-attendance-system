import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🔍 [RolesGuard] Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log('❌ [RolesGuard] No token found');
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('✅ [RolesGuard] Decoded JWT payload:', JSON.stringify(payload, null, 2));
      console.log('👤 [RolesGuard] User role:', payload.role);
      console.log('🎯 [RolesGuard] Role match:', requiredRoles.includes(payload.role));
      
      request.user = payload;
      
      if (!requiredRoles.includes(payload.role)) {
        console.log('🚫 [RolesGuard] Access denied - Role mismatch');
        throw new ForbiddenException(`Access denied: Requires ${requiredRoles.join(' or ')} role, but user has ${payload.role} role`);
      }
      
      return true;
    } catch (error) {
      console.log('❌ [RolesGuard] Error:', error.message);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
