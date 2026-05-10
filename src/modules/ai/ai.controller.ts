import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  SummarizeArticleRequest,
  SummarizeArticleResponse,
} from './dto/summarize-article.dto';
import { Public } from '../auth/decorators/public.decorator';
import {
  TranslateArticleRequest,
  TranslateArticleResponse,
} from './dto/translate-article.dto';
import {
  AnalyzeArticleRequest,
  AnalyzeArticleResponse,
} from './dto/analyze-article.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GenerateRequest, GenerateResponse } from './dto/generate.dto';
import { ReindexRequest, ReindexResponse } from './dto/reindex.dto';
import { RagSearchRequest, RagSearchResponse } from './dto/rag-search.dto';

@Controller('ai')
@UseGuards(ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async summarizeArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() request: SummarizeArticleRequest,
  ): Promise<SummarizeArticleResponse> {
    return this.aiService.summarizeArticle(articleId, request);
  }

  @Public()
  @Post('articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  async translateArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() request: TranslateArticleRequest,
  ): Promise<TranslateArticleResponse> {
    return this.aiService.translateArticle(articleId, request);
  }

  @Public()
  @Post('articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() request: AnalyzeArticleRequest,
  ): Promise<AnalyzeArticleResponse> {
    return this.aiService.analyzeArticle(articleId, request);
  }

  @Public()
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.aiService.getTrackingStats();
  }

  @Public()
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() request: GenerateRequest): Promise<GenerateResponse> {
    return this.aiService.generateText(request);
  }

  @Public()
  @Post('rag/index')
  @HttpCode(HttpStatus.OK)
  async reindex(@Body() request: ReindexRequest): Promise<ReindexResponse> {
    return this.aiService.reindexArticles(request);
  }

  @Public()
  @Post('rag/search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() request: RagSearchRequest): Promise<RagSearchResponse> {
    return this.aiService.searchArticles(request);
  }
}
