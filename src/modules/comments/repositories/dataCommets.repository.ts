import { Injectable } from '@nestjs/common';
import { IComment } from '@/common/interfaces/comment.interface';
import { CommentEntity } from '../entities/comment.entity';

@Injectable()
export class CommetsRepo {
  private comments: IComment[] = [
    new CommentEntity({
      content: 'Great article 1!',
      articleId: '2473f6f9-bdbf-4b3d-8169-7ff2641eff9a',
      authorId: '26c8c532-8d2a-4abd-848a-0dd7cbb83f31',
    }),
    new CommentEntity({
      content: 'Great article 2!',
      articleId: 'db0fdc9c-95a4-4a08-92d7-03ae7363471a',
      authorId: '4328b1b8-1bc6-4ec6-9f6b-1ce7eae9892d',
    }),
    new CommentEntity({
      content: 'Great article 3!',
      articleId: '2473f6f9-bdbf-4b3d-8169-7ff2641eff9a',
      authorId: '26c8c532-8d2a-4abd-848a-0dd7cbb83f31',
    }),
  ];

  findByArticleId(articleId: string): IComment[] {
    return this.comments.filter((comment) => comment.articleId === articleId);
  }

  findAll(): IComment[] {
    return [...this.comments];
  }

  findById(id: string): IComment | undefined {
    return this.comments.find((comment) => comment.id === id);
  }

  create(commentData: {
    content: string;
    articleId: string;
    authorId: string | null;
  }): IComment {
    const newComment = new CommentEntity({
      content: commentData.content,
      articleId: commentData.articleId,
      authorId: commentData.authorId,
    });
    this.comments.push(newComment);
    return newComment;
  }

  delete(id: string): boolean {
    const commentIndex = this.comments.findIndex(
      (comment) => comment.id === id,
    );

    if (commentIndex === -1) {
      return false;
    }
    this.comments.splice(commentIndex, 1);
    return true;
  }
}
