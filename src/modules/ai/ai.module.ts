import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { ArticleModule } from '../article/article.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ArticleModule, HttpModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
