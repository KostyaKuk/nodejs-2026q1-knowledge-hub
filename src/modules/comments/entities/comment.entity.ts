import { randomUUID } from 'node:crypto';
import { IComment } from '@/common/interfaces/comment.interface';

export class CommentEntity implements IComment {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: number;

  constructor(partial: Partial<CommentEntity>) {
    this.id = partial.id || randomUUID();
    this.content = partial.content || '';
    this.articleId = partial.articleId || '';
    this.authorId = partial.authorId || null;
    this.createdAt = partial.createdAt || Date.now();
  }
}
