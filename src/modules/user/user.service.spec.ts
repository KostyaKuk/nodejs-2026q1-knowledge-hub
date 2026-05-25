import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@/common/enums/user-role';
import { UpdatePasswordDto } from './dto/update-password.dto';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByLogin: vi.fn(),
      createUser: vi.fn(),
      updatePassword: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaUserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          login: 'user1',
          role: 'VIEWER',
          password: 'hash',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    const mockUser = {
      id: '123',
      login: 'test@test.com',
      password: 'hashed',
      role: 'VIEWER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const result = await userService.findById('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userService.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    const createDto: CreateUserDto = {
      login: 'newuser@test.com',
      password: 'password123',
      role: UserRole.EDITOR,
    };

    const mockCreatedUser = {
      id: '456',
      login: 'newuser@test.com',
      password: 'hashed',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create user successfully', async () => {
      mockUserRepository.findByLogin.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(createDto);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw BadRequestException when login exists', async () => {
      mockUserRepository.findByLogin.mockResolvedValue({
        id: 'helloAnonymus',
        login: createDto.login,
      });
      await expect(userService.createUser(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    const updateDto: UpdatePasswordDto = {
      oldPassword: 'old123',
      newPassword: 'new123',
    };

    const mockUserWithCorrectPassword = {
      id: '123',
      login: 'test@test.com',
      password: 'old123',
      role: UserRole.VIEWER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdatedUser = {
      ...mockUserWithCorrectPassword,
      password: 'new123',
    };

    it('should update password successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(
        mockUserWithCorrectPassword,
      );
      mockUserRepository.updatePassword.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updatePassword('123', updateDto);

      expect(result).toBeDefined();
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
        '123',
        'new123',
      );
    });

    it('should throw ForbiddenException when old password is incorrect', async () => {
      const mockUserWithWrongPassword = {
        ...mockUserWithCorrectPassword,
        password: 'wrong_password',
      };
      mockUserRepository.findById.mockResolvedValue(mockUserWithWrongPassword);

      await expect(
        userService.updatePassword('123', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUser', () => {
    const mockUser = {
      id: '123',
      login: 'test@test.com',
      password: 'hashed',
      role: 'VIEWER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      await expect(userService.deleteUser('123')).resolves.not.toThrow();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userService.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
