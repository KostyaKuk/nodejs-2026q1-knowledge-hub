import { IsString, IsOptional, IsUUID, IsArray, IsEnum } from 'class-validator';
import { ArticleStatus } from '@/common/enums/article-status.enum';
import { CreateArticleDto } from './create-article.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;

  @IsOptional()
  @IsEnum(ArticleStatus, {
    message: 'Status must be : draft, published or archived',
  })
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID(4, { message: 'authorId must be a valid UUID' })
  authorId?: string | null;

  @IsOptional()
  @IsUUID(4, { message: 'categoryId must be a valid UUID' })
  categoryId?: string | null;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
