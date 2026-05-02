import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
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
}
