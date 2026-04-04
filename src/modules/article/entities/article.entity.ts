import { randomUUID } from 'node:crypto';
import { Article } from '@/common/interfaces/article.interface';
import { ArticleStatus } from '@/common/enums/article-status.enum';

export class ArticleEntity implements Article {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;

  constructor(partial: Partial<ArticleEntity>) {
    this.id = partial.id || randomUUID();
    this.title = partial.title || '';
    this.content = partial.content || '';
    this.status = partial.status || ArticleStatus.DRAFT;
    this.authorId = partial.authorId || null;
    this.categoryId = partial.categoryId || null;
    this.tags = partial.tags || [];
    const now = Date.now();
    this.createdAt = partial.createdAt || now;
    this.updatedAt = partial.updatedAt || now;
  }
}
