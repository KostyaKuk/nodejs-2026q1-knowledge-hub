import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IComment } from '@/common/interfaces/comment.interface';
import { GetCommentsDto } from './dto/get-comments.dto';
import { CommetsRepo } from './repositories/dataCommets.repository';
import { CreateCommentDto } from './dto/create-comments.dto';
import { ArticleRepo } from '../article/repositories/dataArticle.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommetsRepo,
    private readonly articleRepo: ArticleRepo,
  ) {}

  findByArticleId(query: GetCommentsDto): IComment[] {
    return this.commentRepository.findByArticleId(query.articleId);
  }

  create(
    createCommentDto: CreateCommentDto,
    authorId: string | null = null,
  ): IComment {
    const article = this.articleRepo.findById(createCommentDto.articleId);

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

  delete(id: string): void {
    const comment = this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    const deleted = this.commentRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  findById(id: string): IComment {
    const comment = this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return comment;
  }
}
