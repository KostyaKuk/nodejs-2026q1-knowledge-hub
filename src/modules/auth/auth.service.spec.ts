import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@/common/enums/user-role';

vi.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaService: any;
  let mockTokenService: any;

  const mockUser = {
    id: '123e4555-e89b-12d3-a446-426114174000',
    login: 'test@example.com',
    password: 'hashed_password',
    role: UserRole.VIEWER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    ...mockUser,
    login: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockEditorUser = {
    ...mockUser,
    login: 'editor@example.com',
    role: UserRole.EDITOR,
  };

  const mockAccessToken = 'mock_access_token';
  const mockRefreshToken = 'mock_refresh_token';
  const mockNewAccessToken = 'new_mock_access_token';
  const mockNewRefreshToken = 'new_mock_refresh_token';

  beforeEach(async () => {
    mockPrismaService = {
      prisma: {
        user: {
          findUnique: vi.fn(),
          create: vi.fn(),
        },
      },
    };

    mockTokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    const signupDto = {
      login: 'newuser@example.com',
      password: 'password123',
    };

    it('should create user successfully with hashed password', async () => {
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      mockPrismaService.prisma.user.create.mockResolvedValue({
        id: '456',
        login: signupDto.login,
        role: UserRole.VIEWER,
      });

      const result = await authService.signup(signupDto);

      expect(result).toEqual({
        message: 'User successfully registered',
        userId: '456',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockPrismaService.prisma.user.create).toHaveBeenCalledWith({
        data: {
          login: signupDto.login,
          password: 'hashed_password',
          role: UserRole.VIEWER,
        },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      login: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully and return tokens', async () => {
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue(mockAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      });
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      });
    });
  });

  describe('refresh (token rotation)', () => {
    const refreshDto = {
      refreshToken: 'valid_refresh_token',
    };

    const validPayload = {
      userId: mockUser.id,
      login: mockUser.login,
      role: mockUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    it('should refresh tokens successfully with valid refresh token', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(validPayload);
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue(mockNewAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(
        mockNewRefreshToken,
      );

      const result = await authService.refresh(refreshDto);

      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
      });
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
      expect(mockPrismaService.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(null);

      await expect(authService.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.refresh(refreshDto)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(null);

      await expect(authService.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate new tokens with updated user data', async () => {
      const updatedUser = {
        ...mockUser,
        login: 'updated@example.com',
      };
      mockTokenService.verifyRefreshToken.mockReturnValue(validPayload);
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(updatedUser);
      mockTokenService.generateAccessToken.mockReturnValue(mockNewAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(
        mockNewRefreshToken,
      );

      await authService.refresh(refreshDto);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
        userId: updatedUser.id,
        login: updatedUser.login,
        role: updatedUser.role,
      });
    });
  });

  describe('RBAC permission checks', () => {
    const loginDto = {
      login: 'test@example.com',
      password: 'password123',
    };

    it('should include user role in JWT payload for ADMIN user', async () => {
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue(mockAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      await authService.login(loginDto);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockAdminUser.id,
          login: mockAdminUser.login,
          role: UserRole.ADMIN,
        }),
      );
    });

    it('should include user role in JWT payload for EDITOR user', async () => {
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(
        mockEditorUser,
      );
      (bcrypt.compare as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue(mockAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      await authService.login(loginDto);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockEditorUser.id,
          login: mockEditorUser.login,
          role: UserRole.EDITOR,
        }),
      );
    });

    it('should include user role in JWT payload for VIEWER user', async () => {
      mockPrismaService.prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue(mockAccessToken);
      mockTokenService.generateRefreshToken.mockReturnValue(mockRefreshToken);

      await authService.login(loginDto);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          login: mockUser.login,
          role: UserRole.VIEWER,
        }),
      );
    });
  });

  describe('Token verification', () => {
    it('should verify access token correctly', async () => {
      const token = 'valid_access_token';
      const expectedPayload = {
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      };
      mockTokenService.verifyAccessToken.mockReturnValue(expectedPayload);

      const result = mockTokenService.verifyAccessToken(token);

      expect(result).toEqual(expectedPayload);
      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith(token);
    });

    it('should return null for invalid access token', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(null);

      const result = mockTokenService.verifyAccessToken('invalid_token');

      expect(result).toBeNull();
    });
  });
});
