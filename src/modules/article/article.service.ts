import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaArticleRepository } from './repositories/prisma-article.repository';
import { QueryArticleDto } from './dto/query-article.dto';
import { Article } from '@/common/interfaces/article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private articleRepo: PrismaArticleRepository) {}

  async findAll(query: QueryArticleDto): Promise<Article[]> {
    return this.articleRepo.findAll(query);
  }

  async findById(id: string): Promise<Article> {
    const article = await this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }
    return article;
  }

  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articleRepo.createArticle(createArticleDto);
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const updatedArticle = await this.articleRepo.update(id, updateArticleDto);

    if (!updatedArticle) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }

    return updatedArticle;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.articleRepo.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }
  }
}
