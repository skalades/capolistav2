import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // if no roles are required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // not authenticated
    }

    // Superadmin has access to everything
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    return requiredRoles.includes(user.role);
  }
}
