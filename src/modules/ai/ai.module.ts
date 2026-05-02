import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { ArticleModule } from '../article/article.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [ArticleModule, HttpModule, ThrottlerModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
