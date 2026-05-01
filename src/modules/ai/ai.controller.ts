import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  SummarizeArticleRequest,
  SummarizeArticleResponse,
} from './dto/summarize-article.dto';
import { Public } from '../auth/decorators/public.decorator';
import { TranslateArticleRequest, TranslateArticleResponse } from './dto/translate-article.dto';

@Controller('ai')
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
}
