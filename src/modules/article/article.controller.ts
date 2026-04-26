import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { QueryArticleDto } from './dto/query-article.dto';
import { Article } from '@/common/interfaces/article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Roles('ADMIN', 'EDITOR', 'VIEWER')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryArticleDto): Promise<Article[]> {
    return this.articleService.findAll(query);
  }

  @Roles('ADMIN', 'EDITOR', 'VIEWER')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Article> {
    return this.articleService.findById(id);
  }

  @Roles('ADMIN', 'EDITOR')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.articleService.createArticle(dto);
  }

  @Roles('ADMIN', 'EDITOR')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articleService.update(id, updateArticleDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.articleService.delete(id);
  }
}
