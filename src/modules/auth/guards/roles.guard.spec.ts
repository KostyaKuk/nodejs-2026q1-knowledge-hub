import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: any;

  const mockViewerUser = { user: { role: UserRole.VIEWER } };
  const mockEditorUser = { user: { role: UserRole.EDITOR } };
  const mockAdminUser = { user: { role: UserRole.ADMIN } };

  const mockExecutionContext = (
    user: any,
    requiredRoles: UserRole[] | null = null,
  ) => {
    const request = user;
    let handler = {};
    const controller = {};

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
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  describe('No roles required', () => {
    it('should allow access when no roles are required', async () => {
      const context = mockExecutionContext(mockViewerUser);
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });
  });

  describe('VIEWER role', () => {
    it('should allow access when required role is VIEWER', async () => {
      const context = mockExecutionContext(mockViewerUser, [UserRole.VIEWER]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.VIEWER]);

      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should deny access when required role is EDITOR', async () => {
      const context = mockExecutionContext(mockViewerUser, [UserRole.EDITOR]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.EDITOR]);

      expect(() => guard.canActivate(context as any)).toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when required role is ADMIN', async () => {
      const context = mockExecutionContext(mockViewerUser, [UserRole.ADMIN]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => guard.canActivate(context as any)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('EDITOR role', () => {
    it('should allow access when required role is EDITOR', async () => {
      const context = mockExecutionContext(mockEditorUser, [UserRole.EDITOR]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.EDITOR]);

      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should deny access when required role is ADMIN', async () => {
      const context = mockExecutionContext(mockEditorUser, [UserRole.ADMIN]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => guard.canActivate(context as any)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('ADMIN role', () => {
    it('should allow access when required role is ADMIN', async () => {
      const context = mockExecutionContext(mockAdminUser, [UserRole.ADMIN]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw ForbiddenException when user is not authenticated', async () => {
      const context = mockExecutionContext({ user: null }, [UserRole.VIEWER]);
      reflector.getAllAndOverride.mockReturnValue([UserRole.VIEWER]);

      expect(() => guard.canActivate(context as any)).toThrow(
        ForbiddenException,
      );
      expect(() => guard.canActivate(context as any)).toThrow(
        'User not authenticated',
      );
    });
  });
});
