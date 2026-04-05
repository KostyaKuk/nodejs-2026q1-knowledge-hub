import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ArticleRepo } from './repositories/dataArticle.repository';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepo],
  exports: [ArticleRepo],
})
export class ArticleModule {}
