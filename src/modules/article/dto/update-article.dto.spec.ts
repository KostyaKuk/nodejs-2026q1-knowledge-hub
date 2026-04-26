import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateArticleDto } from './update-article.dto';
import { ArticleStatus } from '@/common/enums/article-status.enum';
import { v4 as uuidv4 } from 'uuid';

describe('UpdateArticleDto', () => {
  const validateDto = async (dto: UpdateArticleDto) => {
    return await validate(dto);
  };

  describe('Optional fields (all fields are optional)', () => {
    it('should pass validation with empty object (all fields optional)', async () => {
      const dto = plainToClass(UpdateArticleDto, {});
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only title', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        title: 'Updated Title',
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only content', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        content: 'Updated content',
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Title validation', () => {
    it('should pass with valid title', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        title: 'Valid Title',
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when title is not a string', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        title: 12345,
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });
  });

  describe('Content validation', () => {
    it('should pass with valid content', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        content: 'Valid content here',
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when content is not a string', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        content: ['not', 'a', 'string'],
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'content')).toBe(true);
    });
  });

  describe('authorId validation (UUID)', () => {
    it('should pass with valid UUID', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        authorId: uuidv4(),
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with null authorId', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        authorId: null,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        authorId: 'not-a-uuid',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'authorId')).toBe(true);
    });

    it('should fail with numeric authorId', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        authorId: 12345,
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'authorId')).toBe(true);
    });
  });

  describe('categoryId validation (UUID)', () => {
    it('should pass with valid UUID', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        categoryId: uuidv4(),
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with null categoryId', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        categoryId: null,
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid UUID', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        categoryId: 'not-a-uuid',
      });
      const errors = await validateDto(dto);
      expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
    });
  });

  describe('Combined updates', () => {
    it('should pass with multiple fields updated', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        title: 'New Title',
        content: 'New Content',
        status: ArticleStatus.PUBLISHED,
        tags: ['nestjs', 'updated'],
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with all fields', async () => {
      const dto = plainToClass(UpdateArticleDto, {
        title: 'Complete Update',
        content: 'Complete content',
        status: ArticleStatus.ARCHIVED,
        authorId: uuidv4(),
        categoryId: uuidv4(),
        tags: ['full', 'update'],
      });
      const errors = await validateDto(dto);
      expect(errors.length).toBe(0);
    });
  });
});
