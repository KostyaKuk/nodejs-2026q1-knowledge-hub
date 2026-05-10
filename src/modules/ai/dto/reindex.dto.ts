import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ReindexRequest {
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each articleId must be a valid UUID' })
  articleIds?: string[];
}

export class ReindexResponse {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
}
