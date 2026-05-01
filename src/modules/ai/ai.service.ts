import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { GeminiService } from './gemini.service';
import {
  SummarizeArticleRequest,
  SummarizeArticleResponse,
} from './dto/summarize-article.dto';
import { TranslateArticleRequest, TranslateArticleResponse } from './dto/translate-article.dto';

@Injectable()
export class AiService {
  constructor(
    private articleService: ArticleService,
    private geminiService: GeminiService,
  ) {}

  async summarizeArticle(
    articleId: string,
    request: SummarizeArticleRequest,
  ): Promise<SummarizeArticleResponse> {
    const article = await this.articleService.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const summary = await this.geminiService.generateSummary(
      article.title,
      article.content,
      request.maxLength,
    );

    const originalLength = article.content.length;
    const summaryLength = summary.length;

    return {
      articleId: article.id,
      summary,
      originalLength,
      summaryLength,
    };
  }

  async translateArticle(
  articleId: string,
  request: TranslateArticleRequest,
): Promise<TranslateArticleResponse> {
  const article = await this.articleService.findById(articleId);

  if (!article) {
    throw new NotFoundException(`Article with ID "${articleId}" not found`);
  }

  const { translatedText, detectedLanguage } = await this.geminiService.translateText(
    article.content,
    request.targetLanguage,
    request.sourceLanguage,
  );

  return {
    articleId: article.id,
    translatedText,
    detectedLanguage,
  };
}
}
