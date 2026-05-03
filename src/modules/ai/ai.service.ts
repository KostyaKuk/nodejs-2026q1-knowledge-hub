import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { GeminiService } from './gemini.service';
import {
  SummarizeArticleRequest,
  SummarizeArticleResponse,
} from './dto/summarize-article.dto';
import {
  TranslateArticleRequest,
  TranslateArticleResponse,
} from './dto/translate-article.dto';
import {
  AnalyzeArticleRequest,
  AnalyzeArticleResponse,
} from './dto/analyze-article.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AI_CONFIG } from './constants/ai-config.constants';
import { AiTrackingService } from './ai-tracking.service';
import { GenerateRequest, GenerateResponse } from './dto/generate.dto';

@Injectable()
export class AiService {
  constructor(
    private articleService: ArticleService,
    private geminiService: GeminiService,
    private trackingService: AiTrackingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generateCacheKey(
    articleId: string,
    params: any,
    updatedAt: number | Date,
  ): string {
    const paramsString = JSON.stringify(params);
    const timestamp =
      updatedAt instanceof Date ? updatedAt.getTime() : updatedAt;
    return `ai:${articleId}:${paramsString}:${timestamp}`;
  }

  async summarizeArticle(
    articleId: string,
    request: SummarizeArticleRequest,
  ): Promise<SummarizeArticleResponse> {
    const article = await this.articleService.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const cacheKey = this.generateCacheKey(
      articleId,
      request,
      article.updatedAt,
    );
    const cached =
      await this.cacheManager.get<SummarizeArticleResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const { summary, promptTokens, completionTokens } =
      await this.geminiService.generateSummary(
        article.title,
        article.content,
        request.maxLength,
      );

    this.trackingService.incrementSummarize(promptTokens, completionTokens);

    const response: SummarizeArticleResponse = {
      articleId: article.id,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    };

    await this.cacheManager.set(cacheKey, response, AI_CONFIG.cacheTtlMs);

    return response;
  }

  async translateArticle(
    articleId: string,
    request: TranslateArticleRequest,
  ): Promise<TranslateArticleResponse> {
    const article = await this.articleService.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const cacheKey = this.generateCacheKey(
      articleId,
      request,
      article.updatedAt,
    );
    const cached =
      await this.cacheManager.get<TranslateArticleResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const { translatedText, detectedLanguage, promptTokens, completionTokens } =
      await this.geminiService.translateText(
        article.content,
        request.targetLanguage,
        request.sourceLanguage,
      );

    this.trackingService.incrementTranslate(promptTokens, completionTokens);

    const response: TranslateArticleResponse = {
      articleId: article.id,
      translatedText,
      detectedLanguage,
    };

    await this.cacheManager.set(cacheKey, response, AI_CONFIG.cacheTtlMs);

    return response;
  }

  async analyzeArticle(
    articleId: string,
    request: AnalyzeArticleRequest,
  ): Promise<AnalyzeArticleResponse> {
    const article = await this.articleService.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const { analysis, suggestions, severity, promptTokens, completionTokens } =
      await this.geminiService.analyzeArticle(
        article.title,
        article.content,
        request.task,
      );

    this.trackingService.incrementAnalyze(promptTokens, completionTokens);

    return {
      articleId: article.id,
      analysis,
      suggestions,
      severity,
    };
  }

  getTrackingStats() {
    return this.trackingService.getStats();
  }

  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
  const { text } = await this.geminiService.generateFreeText(request.prompt);
  return { response: text };
}
}
