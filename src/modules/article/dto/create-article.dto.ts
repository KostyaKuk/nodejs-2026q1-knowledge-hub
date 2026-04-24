import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ArticleStatus } from '@/common/enums/article-status.enum';

export class CreateArticleDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Contetn must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

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
  @IsArray({ message: 'Tags must be a arrays' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
