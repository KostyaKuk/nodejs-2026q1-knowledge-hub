import { IsOptional, IsIn } from 'class-validator';

export class AnalyzeArticleRequest {
  @IsOptional()
  @IsIn(['review', 'bugs', 'optimize', 'explain'], {
    message: 'task must be one of: review, bugs, optimize, explain',
  })
  task?: 'review' | 'bugs' | 'optimize' | 'explain' = 'review';
}

export class AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
}
