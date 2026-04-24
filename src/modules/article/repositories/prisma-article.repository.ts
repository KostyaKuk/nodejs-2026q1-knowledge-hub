import { Injectable } from '@nestjs/common';
import { Article } from '@/common/interfaces/article.interface';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { QueryArticleDto } from '../dto/query-article.dto';
import { ArticleStatus } from '@/common/enums/article-status.enum';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaArticleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private toDomain(article: any): Article {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      status: article.status,
      authorId: article.authorId,
      categoryId: article.categoryId || undefined,
      tags: article.tags ? article.tags.map((t: any) => t.name) : [],
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }

  async findAll(query: QueryArticleDto): Promise<Article[]> {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.tag) {
      where.tags = {
        some: { name: { equals: query.tag, mode: 'insensitive' } },
      };
    }

    const articles = await this.prismaService.prisma.article.findMany({
      where,
      include: { tags: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return articles.map((a) => this.toDomain(a));
  }

  async findById(id: string): Promise<Article | undefined> {
    const article = await this.prismaService.prisma.article.findUnique({
      where: { id },
      include: { tags: { select: { name: true } } },
    });

    return article ? this.toDomain(article) : undefined;
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    const article = await this.prismaService.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status || ArticleStatus.DRAFT,
        authorId: dto.authorId,
        categoryId: dto.categoryId || null,
        tags: {
          connectOrCreate: (dto.tags || []).map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: { select: { name: true } } },
    });

    return this.toDomain(article);
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
  ): Promise<Article | undefined> {
    try {
      const article = await this.prismaService.prisma.article.update({
        where: { id },
        data: {
          title: dto.title,
          content: dto.content,
          status: dto.status,
          categoryId: dto.categoryId,
          ...(dto.tags && {
            tags: {
              set: [],
              connectOrCreate: dto.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }),
        },
        include: { tags: { select: { name: true } } },
      });

      return this.toDomain(article);
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prismaService.prisma.article.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
