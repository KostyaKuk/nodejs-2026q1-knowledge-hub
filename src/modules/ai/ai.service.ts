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
import { QdrantService } from './qdrant.service';
import { EmbeddingService } from './embedding.service';
import { ReindexRequest, ReindexResponse } from './dto/reindex.dto';
import { RagSearchRequest, RagSearchResponse } from './dto/rag-search.dto';
import { RagChatRequest, RagChatResponse } from './dto/rag-chat.dto';
import { v4 as uuidv4 } from 'uuid';
import { ChunkingService } from './chunking.service';

@Injectable()
export class AiService {
  constructor(
    private articleService: ArticleService,
    private geminiService: GeminiService,
    private trackingService: AiTrackingService,
    private qdrantService: QdrantService,
    private embeddingService: EmbeddingService,
    private chunkingService: ChunkingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async deleteArticleFromIndex(articleId: string): Promise<void> {
    const article = await this.articleService.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const deleted = await this.qdrantService.deletePointsByArticleId(articleId);

    if (!deleted) {
      throw new NotFoundException(
        `No vector records found for article ID "${articleId}"`,
      );
    }
  }

  async chat(request: RagChatRequest): Promise<RagChatResponse> {
    const conversationId = request.conversationId || uuidv4();

    const embedding = await this.embeddingService.generateEmbedding(
      request.question,
    );

    const searchResults = await this.qdrantService.searchWithFilters(
      embedding,
      5,
      { articleStatus: 'PUBLISHED' },
    );

    if (searchResults.length === 0) {
      return {
        answer: 'I cannot find relevant information in the knowledge base.',
        sources: [],
        conversationId,
      };
    }

    const context = searchResults.map((r) => ({
      title: r.payload.title,
      content: r.payload.content,
    }));

    const answer = await this.geminiService.generateRagAnswer(
      request.question,
      context,
    );

    const sources = searchResults.map((r) => ({
      articleId: r.payload.articleId,
      articleTitle: r.payload.title,
      relevantChunk: r.payload.content,
    }));

    return {
      answer,
      sources,
      conversationId,
    };
  }

  async searchArticles(request: RagSearchRequest): Promise<RagSearchResponse> {
    const embedding = await this.embeddingService.generateEmbedding(
      request.query,
    );
    console.log(`✅ Embedding generated, length: ${embedding.length}`);

    const filters = {
      articleStatus: request.articleStatus,
      categoryId: request.categoryId,
      tags: request.tags,
    };

    const results = await this.qdrantService.searchWithFilters(
      embedding,
      request.limit || 5,
      filters,
    );

    return {
      results: results.map((r) => ({
        articleId: r.payload.articleId,
        articleTitle: r.payload.title,
        chunk: r.payload.content,
        similarity: r.score,
      })),
    };
  }

  async reindexArticles(request: ReindexRequest): Promise<ReindexResponse> {
    const { onlyPublished = true, articleIds } = request;

    let articles = await this.articleService.findAll({});

    if (onlyPublished) {
      articles = articles.filter((a) => a.status === 'PUBLISHED');
    }

    if (articleIds && articleIds.length > 0) {
      articles = articles.filter((a) => articleIds.includes(a.id));
    }

    if (articles.length === 0) {
      return {
        indexedArticles: 0,
        indexedChunks: 0,
        vectorCollection:
          process.env.QDRANT_COLLECTION || 'knowledge_hub_articles',
      };
    }

    let indexedArticles = 0;
    let indexedChunks = 0;

    for (const article of articles) {
      const fullText = `${article.title}\n\n${article.content}`;

      const chunks = this.chunkingService.chunkText(fullText, article.id);
      console.log(
        `📝 Article "${article.title}" split into ${chunks.length} chunks`,
      );

      for (const chunk of chunks) {
        try {
          const embedding = await this.embeddingService.generateEmbedding(
            chunk.text,
          );

          await this.qdrantService.upsertPoint(chunk.id, embedding, {
            articleId: article.id,
            title: article.title,
            content: chunk.text,
            chunkIndex: chunk.index,
            status: article.status,
            createdAt: article.createdAt,
          });

          indexedChunks++;
        } catch (error) {
          console.error(`❌ Failed to index chunk ${chunk.id}:`, error);
        }
      }

      indexedArticles++;
    }

    return {
      indexedArticles,
      indexedChunks,
      vectorCollection:
        process.env.QDRANT_COLLECTION || 'knowledge_hub_articles',
    };
  }

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
