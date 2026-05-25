import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateArticleDto } from './create-article.dto';
import { ArticleStatus } from '@/common/enums/article-status.enum';

describe('CreateArticleDto', () => {
  const validDto = {
    title: 'Test Article',
    content: 'Test content',
    status: ArticleStatus.DRAFT,
    tags: ['nestjs', 'typescript'],
  };

  describe('Required fields', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateArticleDto, validDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when title is missing', async () => {
      const dto = plainToClass(CreateArticleDto, {
        content: 'Test content',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail when content is missing', async () => {
      const dto = plainToClass(CreateArticleDto, {
        title: 'Test Article',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'content')).toBe(true);
    });

    it('should fail when title is empty', async () => {
      const dto = plainToClass(CreateArticleDto, {
        title: '',
        content: 'Test content',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail when content is empty', async () => {
      const dto = plainToClass(CreateArticleDto, {
        title: 'Test Article',
        content: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'content')).toBe(true);
    });
  });

  describe('Enum validation (status)', () => {
    it('should pass with status DRAFT', async () => {
      const dto = plainToClass(CreateArticleDto, {
        ...validDto,
        status: ArticleStatus.DRAFT,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with status PUBLISHED', async () => {
      const dto = plainToClass(CreateArticleDto, {
        ...validDto,
        status: ArticleStatus.PUBLISHED,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass with status ARCHIVED', async () => {
      const dto = plainToClass(CreateArticleDto, {
        ...validDto,
        status: ArticleStatus.ARCHIVED,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when status is omitted', async () => {
      const dto = plainToClass(CreateArticleDto, {
        title: 'Test',
        content: 'Content',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(false);
    });

    it('should fail with invalid status', async () => {
      const dto = plainToClass(CreateArticleDto, {
        ...validDto,
        status: 'INVALID_STATUS',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });
  });
});
