import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RagChatRequest {
  @IsString({ message: 'question must be a string' })
  @IsNotEmpty({ message: 'question is required' })
  question: string;

  @IsOptional()
  conversationId?: string;
}

export class RagChatResponse {
  answer?: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;
}
