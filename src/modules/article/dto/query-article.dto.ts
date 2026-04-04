import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ArticleStatus } from '@/common/enums/article-status.enum';

export class QueryArticleDto {
  @IsOptional()
  @IsEnum(ArticleStatus, {
    message: 'status must be draft, published or archived',
  })
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID(4, { message: 'categoryId must be valid UUID' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'tag must be a string' })
  tag?: string;
}
