import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IComment } from '@/common/interfaces/comment.interface';
import { PrismaCommentRepository } from './repositories/prisma-comment.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { GetCommentsDto } from './dto/get-comments.dto';
import { CreateCommentDto } from './dto/create-comments.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: PrismaCommentRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async findByArticleId(query: GetCommentsDto): Promise<IComment[]> {
    return this.commentRepository.findByArticleId(query.articleId);
  }

  async findById(id: string): Promise<IComment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
    return comment;
  }

  async create(
    createCommentDto: CreateCommentDto,
    authorId: string | null = null,
  ): Promise<IComment> {
    const article = await this.prismaService.prisma.article.findUnique({
      where: { id: createCommentDto.articleId },
    });

    if (!article) {
      throw new UnprocessableEntityException(
        `Article with ID "${createCommentDto.articleId}" does not exist`,
      );
    }

    return this.commentRepository.create({
      content: createCommentDto.content,
      articleId: createCommentDto.articleId,
      authorId: authorId,
    });
  }

  async delete(id: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    const deleted = await this.commentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  async deleteByArticleId(articleId: string): Promise<void> {
    await this.commentRepository.deleteByArticleId(articleId);
  }

  async deleteByAuthorId(authorId: string): Promise<void> {
    await this.commentRepository.deleteByAuthorId(authorId);
  }
}
