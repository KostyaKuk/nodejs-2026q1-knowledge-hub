import { Injectable } from '@nestjs/common';
import { IComment } from '@/common/interfaces/comment.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaCommentRepository {
  constructor(private prismaService: PrismaService) {}

  private toDomain(comment: any): IComment {
    return {
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId || null,
      createdAt: comment.createdAt.getTime(),
    };
  }

  async findByArticleId(articleId: string): Promise<IComment[]> {
    const comments = await this.prismaService.prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map((c) => this.toDomain(c));
  }

  async findById(id: string): Promise<IComment | undefined> {
    const comment = await this.prismaService.prisma.comment.findUnique({
      where: { id },
    });
    return comment ? this.toDomain(comment) : undefined;
  }

  async create(commentData: {
    content: string;
    articleId: string;
    authorId: string | null;
  }): Promise<IComment> {
    const newComment = await this.prismaService.prisma.comment.create({
      data: {
        content: commentData.content,
        articleId: commentData.articleId,
        authorId: commentData.authorId,
      },
    });
    return this.toDomain(newComment);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prismaService.prisma.comment.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByArticleId(articleId: string): Promise<void> {
    await this.prismaService.prisma.comment.deleteMany({
      where: { articleId },
    });
  }

  async deleteByAuthorId(authorId: string): Promise<void> {
    await this.prismaService.prisma.comment.deleteMany({
      where: { authorId },
    });
  }
}
