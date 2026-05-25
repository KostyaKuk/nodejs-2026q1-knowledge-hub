import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '@/common/enums/user-role';

describe('CreateUserDto', () => {
  const validateDto = async (dto: CreateUserDto) => {
    return await validate(dto);
  };

  describe('Required fields', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'validuser',
        password: 'password123',
        role: UserRole.VIEWER,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when login is missing', async () => {
      const dto = plainToClass(CreateUserDto, {
        password: 'password123',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'login')).toBe(true);
    });

    it('should fail when password is missing', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'validuser',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when login is empty', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: '',
        password: 'password123',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'login')).toBe(true);
    });

    it('should fail when password is empty', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'validuser',
        password: '',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });

  describe('Field length validation', () => {
    it('should fail when login is less than 3 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'ab',
        password: 'password123',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'login')).toBe(true);
    });

    it('should fail when login exceeds 50 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'a'.repeat(51),
        password: 'password123',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'login')).toBe(true);
    });

    it('should fail when password is less than 3 characters', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'validuser',
        password: '12345',
      });
      const errors = await validateDto(dto);
      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
    });
  });

  describe('Enum validation (role)', () => {
    it('should pass with role ADMIN', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'admin',
        password: 'password123',
        role: UserRole.ADMIN,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with role EDITOR', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'editor',
        password: 'password123',
        role: UserRole.EDITOR,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with role VIEWER', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'viewer',
        password: 'password123',
        role: UserRole.VIEWER,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when role is omitted', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'user',
        password: 'password123',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'role')).toBe(false);
    });

    it('should fail with invalid role', async () => {
      const dto = plainToClass(CreateUserDto, {
        login: 'user',
        password: 'password123',
        role: 'INVALID_ROLE',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'role')).toBe(true);
    });
  });
});
