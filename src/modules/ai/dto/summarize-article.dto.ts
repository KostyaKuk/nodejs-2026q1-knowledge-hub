import { IsOptional, IsIn } from 'class-validator';

export class SummarizeArticleRequest {
  @IsOptional()
  @IsIn(['short', 'medium', 'detailed'], {
    message: 'maxLength must be short, medium, or detailed',
  })
  maxLength?: 'short' | 'medium' | 'detailed' = 'medium';
}

export class SummarizeArticleResponse {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
}
