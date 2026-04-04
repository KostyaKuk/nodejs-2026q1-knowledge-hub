import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepo } from './repositories/dataArticle.repository';
import { QueryArticleDto } from './dto/query-article.dto';
import { Article } from '@/common/interfaces/article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private articleRepo: ArticleRepo) {}

  findAll(query: QueryArticleDto): Article[] {
    let articles = this.articleRepo.findAll();

    if (query.status) {
      articles = articles.filter((article) => article.status === query.status);
    }

    if (query.categoryId) {
      articles = articles.filter(
        (article) => article.categoryId === query.categoryId,
      );
    }

    if (query.tag) {
      articles = articles.filter((article) =>
        article.tags.some(
          (tag) => tag.toLowerCase() === query.tag!.toLowerCase(),
        ),
      );
    }

    return articles;
  }

  findById(id: string): Article {
    const article = this.articleRepo.findById(id);
    if (!article) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }
    return article;
  }

  createArticle(createArticleDto: CreateArticleDto): Article {
    return this.articleRepo.createArticle(createArticleDto);
  }

  update(id: string, updateArticleDto: UpdateArticleDto): Article {
    const updatedArticle = this.articleRepo.update(id, updateArticleDto);

    if (!updatedArticle) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }

    return updatedArticle;
  }

  delete(id: string): void {
    const deleted = this.articleRepo.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Article with "${id}" not found`);
    }
  }
}
