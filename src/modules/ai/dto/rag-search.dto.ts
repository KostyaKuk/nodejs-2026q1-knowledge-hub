import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsUUID,
  IsArray,
} from 'class-validator';

export class RagSearchRequest {
  @IsString({ message: 'query must be a string' })
  @IsNotEmpty({ message: 'query is required' })
  query: string;

  @IsOptional()
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(20, { message: 'limit must not exceed 20' })
  limit?: number = 5;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'], {
    message: 'articleStatus must be draft, published, or archived',
  })
  articleStatus?: 'draft' | 'published' | 'archived';

  @IsOptional()
  @IsUUID(4, { message: 'categoryId must be a valid UUID' })
  categoryId?: string;

  @IsOptional()
  @IsArray({ message: 'tags must be an array' })
  @IsString({ each: true, message: 'each tag must be a string' })
  tags?: string[];
}

export class RagSearchResponse {
  answer?: string;
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;
}
