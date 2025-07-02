// src/common/guards/jwt-cookie-roles.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtCookieRolesGuard implements CanActivate {
  private readonly logger = new Logger(JwtCookieRolesGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['access_token'];    

    if (!token) {
      this.logger.warn('Access token not found in cookies');
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      if (!roles || roles.length === 0) return true;

      const hasRole = roles.includes(payload.role);
      if (!hasRole) {
        this.logger.warn(
          `User role '${payload.role}' does not have access. Required roles: [${roles.join(', ')}]`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (err) {
      this.logger.error('Token verification failed', err);
      throw new UnauthorizedException('You are not authorized for this resource');
    }
  }
}
