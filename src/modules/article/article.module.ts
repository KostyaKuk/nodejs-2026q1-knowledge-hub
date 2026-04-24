import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaArticleRepository } from './repositories/prisma-article.repository';

@Module({
  imports: [PrismaModule, ArticleModule],
  controllers: [ArticleController],
  providers: [ArticleService, PrismaArticleRepository],
})
export class ArticleModule {}
