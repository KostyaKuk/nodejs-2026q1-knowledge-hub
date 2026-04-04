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

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryArticleDto): Article[] {
    return this.articleService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseUUIDPipe) id: string): Article {
    return this.articleService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateArticleDto): Article {
    return this.articleService.createArticle(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): void {
    return this.articleService.delete(id);
  }
}
