import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('ParseUUIDPipe', () => {
  let pipe: ParseUUIDPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseUUIDPipe],
    }).compile();

    pipe = module.get<ParseUUIDPipe>(ParseUUIDPipe);
  });

  describe('Valid UUID', () => {
    it('should pass through a valid UUID v4', async () => {
      const validUuid = uuidv4();
      const result = await pipe.transform(validUuid, {
        type: 'param',
        metatype: String,
        data: 'id',
      });
      expect(result).toBe(validUuid);
    });
  });

  describe('Invalid UUID', () => {
    it('should throw BadRequestException for empty string', async () => {
      await expect(
        pipe.transform('', { type: 'param', metatype: String, data: 'id' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-UUID string', async () => {
      await expect(
        pipe.transform('not-a-uuid', {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for numeric ID', async () => {
      await expect(
        pipe.transform('12345', {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UUID without hyphens', async () => {
      const uuidWithoutHyphens = uuidv4().replace(/-/g, '');
      await expect(
        pipe.transform(uuidWithoutHyphens, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null value', async () => {
      await expect(
        pipe.transform(null as any, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for undefined value', async () => {
      await expect(
        pipe.transform(undefined as any, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for UUID with spaces', async () => {
      const validUuid = uuidv4();
      await expect(
        pipe.transform(`  ${validUuid}  `, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Custom options', () => {
    it('should accept UUID v1 when version is not specified', async () => {
      const pipeWithoutVersion = new ParseUUIDPipe({ version: undefined });
      const uuidV1 = '6ec0bd7e-11f0-11ee-be56-0242ac120002';
      const result = await pipeWithoutVersion.transform(uuidV1, {
        type: 'param',
        metatype: String,
        data: 'id',
      });
      expect(result).toBe(uuidV1);
    });

    it('should reject UUID v1 when version is set to 4', async () => {
      const pipeV4Only = new ParseUUIDPipe({ version: '4' });
      const uuidV1 = '6ec0bd7e-11f0-11ee-be56-0242ac120002';
      await expect(
        pipeV4Only.transform(uuidV1, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept UUID v4 with custom message', async () => {
      const customPipe = new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () =>
          new BadRequestException('Custom UUID error message'),
      });
      const validUuid = uuidv4();
      const result = await customPipe.transform(validUuid, {
        type: 'param',
        metatype: String,
        data: 'id',
      });
      expect(result).toBe(validUuid);
    });

    it('should throw custom exception for invalid UUID', async () => {
      const customPipe = new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () =>
          new BadRequestException('Custom UUID error message'),
      });
      await expect(
        customPipe.transform('invalid', {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow(new BadRequestException('Custom UUID error message'));
    });
  });
});
