import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ArticleService } from './article.service';
import { PrismaArticleRepository } from './repositories/prisma-article.repository';
import { QueryArticleDto } from './dto/query-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus } from '@/common/enums/article-status.enum';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let mockArticleRepo: any;

  const mockArticle = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Article',
    content: 'Test Content',
    status: ArticleStatus.DRAFT,
    authorId: 'user',
    categoryId: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPublishedArticle = {
    ...mockArticle,
    status: ArticleStatus.PUBLISHED,
  };

  const mockArticleWithTags = {
    ...mockArticle,
    tags: [{ name: 'nestjs' }, { name: 'prisma' }],
  };

  beforeEach(async () => {
    mockArticleRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      createArticle: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: PrismaArticleRepository,
          useValue: mockArticleRepo,
        },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
  });

  describe('findAll', () => {
    it('should return all articles without filters', async () => {
      const query: QueryArticleDto = {};
      const mockArticles = [mockArticle, mockPublishedArticle];
      mockArticleRepo.findAll.mockResolvedValue(mockArticles);

      const result = await articleService.findAll(query);

      expect(result).toEqual(mockArticles);
      expect(mockArticleRepo.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter articles by status', async () => {
      const query: QueryArticleDto = { status: ArticleStatus.PUBLISHED };
      mockArticleRepo.findAll.mockResolvedValue([mockPublishedArticle]);

      const result = await articleService.findAll(query);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ArticleStatus.PUBLISHED);
    });

    it('should filter articles by tag', async () => {
      const query: QueryArticleDto = { tag: 'nestjs' };
      mockArticleRepo.findAll.mockResolvedValue([mockArticleWithTags]);

      const result = await articleService.findAll(query);

      expect(result[0].tags).toContainEqual({ name: 'nestjs' });
    });

    it('should return empty array when no articles match filters', async () => {
      const query: QueryArticleDto = { status: ArticleStatus.PUBLISHED };
      mockArticleRepo.findAll.mockResolvedValue([]);

      const result = await articleService.findAll(query);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return article when found', async () => {
      mockArticleRepo.findById.mockResolvedValue(mockArticle);

      const result = await articleService.findById(mockArticle.id);

      expect(result).toEqual(mockArticle);
      expect(mockArticleRepo.findById).toHaveBeenCalledWith(mockArticle.id);
    });

    it('should throw NotFoundException when article not found', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);

      await expect(articleService.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createArticle', () => {
    const createDto: CreateArticleDto = {
      title: 'New Article',
      content: 'New Content',
      status: ArticleStatus.DRAFT,
      tags: ['nestjs', 'prisma'],
    };

    const mockCreatedArticle = {
      ...mockArticle,
      title: createDto.title,
      content: createDto.content,
      status: createDto.status,
      tags: createDto.tags.map((name) => ({ name })),
    };

    it('should create a new article with provided data', async () => {
      mockArticleRepo.createArticle.mockResolvedValue(mockCreatedArticle);

      const result = await articleService.createArticle(createDto);

      expect(result).toEqual(mockCreatedArticle);
      expect(mockArticleRepo.createArticle).toHaveBeenCalledWith(createDto);
    });

    it('should create article with DRAFT status by default', async () => {
      const createDtoWithoutStatus: CreateArticleDto = {
        title: 'No Status Article',
        content: 'Content',
      };
      const mockCreatedWithDefaultStatus = {
        ...mockArticle,
        title: createDtoWithoutStatus.title,
        status: ArticleStatus.DRAFT,
      };
      mockArticleRepo.createArticle.mockResolvedValue(
        mockCreatedWithDefaultStatus,
      );

      const result = await articleService.createArticle(createDtoWithoutStatus);

      expect(result.status).toBe(ArticleStatus.DRAFT);
    });
  });

  describe('update', () => {
    const updateId = mockArticle.id;

    it('should update article title', async () => {
      const updateDto: UpdateArticleDto = { title: 'Updated Title' };
      const mockUpdatedArticle = { ...mockArticle, title: 'Updated Title' };
      mockArticleRepo.update.mockResolvedValue(mockUpdatedArticle);

      const result = await articleService.update(updateId, updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('should allow status transition DRAFT -> PUBLISHED', async () => {
      const updateDto: UpdateArticleDto = { status: ArticleStatus.PUBLISHED };
      mockArticleRepo.update.mockResolvedValue({
        ...mockArticle,
        status: ArticleStatus.PUBLISHED,
      });

      const result = await articleService.update(updateId, updateDto);

      expect(result.status).toBe(ArticleStatus.PUBLISHED);
    });

    it('should allow updating tags', async () => {
      const updateDto: UpdateArticleDto = {
        tags: ['nestjs', 'typescript', 'new-tag'],
      };
      const mockUpdatedWithTags = {
        ...mockArticle,
        tags: updateDto.tags.map((name) => ({ name })),
      };
      mockArticleRepo.update.mockResolvedValue(mockUpdatedWithTags);

      const result = await articleService.update(updateId, updateDto);

      expect(result.tags).toHaveLength(3);
    });

    it('should throw NotFoundException when updating non-existent article', async () => {
      mockArticleRepo.update.mockResolvedValue(null);

      await expect(
        articleService.update('non-existent', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete article successfully', async () => {
      mockArticleRepo.delete.mockResolvedValue(true);

      await expect(
        articleService.delete(mockArticle.id),
      ).resolves.not.toThrow();
      expect(mockArticleRepo.delete).toHaveBeenCalledWith(mockArticle.id);
    });

    it('should throw NotFoundException when deleting non-existent article', async () => {
      mockArticleRepo.delete.mockResolvedValue(false);

      await expect(articleService.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
