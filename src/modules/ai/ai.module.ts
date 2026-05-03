import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { ArticleModule } from '../article/article.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiTrackingService } from './ai-tracking.service';
import { PromptsModule } from './prompts/prompts.module';

@Module({
  imports: [ArticleModule, HttpModule, ThrottlerModule, PromptsModule],
  controllers: [AiController],
  providers: [AiService, GeminiService, AiTrackingService],
  exports: [AiTrackingService],
})
export class AiModule {}
