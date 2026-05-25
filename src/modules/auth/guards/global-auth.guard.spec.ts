import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { GlobalAuthGuard } from './global-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role';

describe('GlobalAuthGuard', () => {
  let guard: GlobalAuthGuard;
  let jwtService: any;
  let reflector: any;

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    login: 'test@example.com',
    role: UserRole.VIEWER,
  };

  const mockAdminUser = {
    ...mockUser,
    role: UserRole.ADMIN,
  };

  const mockExecutionContext = (
    isPublic = false,
    requiredRoles = null,
    hasAuth = true,
    token = 'valid_token',
  ) => {
    const request = {
      headers: hasAuth ? { authorization: `Bearer ${token}` } : {},
      user: null,
    };

    let handler = {};
    const controller = {};

    if (isPublic) {
      handler = { [IS_PUBLIC_KEY]: true };
    }

    if (requiredRoles) {
      handler = { [ROLES_KEY]: requiredRoles };
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => handler,
      getClass: () => controller,
    };
  };

  beforeEach(async () => {
    jwtService = {
      verify: vi.fn(),
    };

    reflector = {
      getAllAndOverride: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalAuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<GlobalAuthGuard>(GlobalAuthGuard);
  });

  describe('Public routes', () => {
    it('should allow access to public routes without token', async () => {
      const context = mockExecutionContext(true);
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });
  });

  describe('Protected routes', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = mockExecutionContext(false, null, false);
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context as any)).rejects.toThrow(
        'Authorization is not implemented',
      );
    });

    it('should throw UnauthorizedException when invalid authorization format', async () => {
      const request = {
        headers: { authorization: 'InvalidFormat' },
        user: null,
      };
      const context = {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => ({}),
        getClass: () => ({}),
      };
      reflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const context = mockExecutionContext(false);
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context as any)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should allow access with valid token', async () => {
      const context = mockExecutionContext(false);
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockUser);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalled();
    });
  });

  describe('Role-based access', () => {
    it('should allow access when user has required role', async () => {
      const context = mockExecutionContext(false, [UserRole.ADMIN]);
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === ROLES_KEY) return [UserRole.ADMIN];
        return false;
      });
      jwtService.verify.mockReturnValue(mockAdminUser);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', async () => {
      const context = mockExecutionContext(false, [UserRole.ADMIN]);
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === ROLES_KEY) return [UserRole.ADMIN];
        return false;
      });
      jwtService.verify.mockReturnValue(mockUser);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
