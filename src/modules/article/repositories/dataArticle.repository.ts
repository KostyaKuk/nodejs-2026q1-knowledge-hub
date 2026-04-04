import { Injectable } from '@nestjs/common';
import { Article } from '@/common/interfaces/article.interface';
import { ArticleEntity } from '../entities/article.entity';
import { ArticleStatus } from '@/common/enums/article-status.enum';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';

@Injectable()
export class ArticleRepo {
  private articles: Article[] = [
    new ArticleEntity({
      title: 'first title',
      content: 'hello this is my first article...',
      status: ArticleStatus.PUBLISHED,
      authorId: '26c8c532-8d2a-4abd-848a-0dd7cbb83f31',
      categoryId: 'c1d2e3f4-g5h6-7890-ijkl-mn2345000000',
      tags: ['book', 'magazines', 'accessories'],
    }),
    new ArticleEntity({
      title: 'Second title',
      content: 'hello this is my second article...',
      status: ArticleStatus.DRAFT,
      authorId: '4328b1b8-1bc6-4ec6-9f6b-1ce7eae9892d',
      categoryId: 'c2d3e4f5-g6h7-8901-ijkl-mn2345000000',
      tags: ['book', 'accessories'],
    }),
  ];

  findAll(): Article[] {
    return [...this.articles];
  }

  findById(id: string): Article {
    return this.articles.find((article) => article.id === id);
  }

  createArticle(createArticleDto: CreateArticleDto): Article {
    const newArticle = new ArticleEntity({
      title: createArticleDto.title,
      content: createArticleDto.content,
      status: createArticleDto.status || ArticleStatus.DRAFT,
      authorId: createArticleDto.authorId || null,
      categoryId: createArticleDto.categoryId || null,
      tags: createArticleDto.tags || [],
    });
    this.articles.push(newArticle);
    return newArticle;
  }

  update(id: string, updateArticleDto: UpdateArticleDto): Article | undefined {
    const articleIndex = this.articles.findIndex(
      (article) => article.id === id,
    );
    if (articleIndex === -1) {
      return undefined;
    }
    const updatedArticle = {
      ...this.articles[articleIndex],
      ...updateArticleDto,
      updatedAt: Date.now(),
    };

    this.articles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  delete(id: string): boolean {
    const articleIndex = this.articles.findIndex(
      (article) => article.id === id,
    );

    if (articleIndex === -1) {
      return false;
    }

    this.articles.splice(articleIndex, 1);
    return true;
  }
}
