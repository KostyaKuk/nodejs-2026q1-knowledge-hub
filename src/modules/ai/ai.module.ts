import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { ArticleModule } from '../article/article.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiTrackingService } from './ai-tracking.service';
import { PromptsModule } from './prompts/prompts.module';
import { QdrantService } from './qdrant.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';

@Module({
  imports: [ArticleModule, HttpModule, ThrottlerModule, PromptsModule],
  controllers: [AiController],
  providers: [
    AiService,
    GeminiService,
    AiTrackingService,
    QdrantService,
    EmbeddingService,
    ChunkingService,
  ],
  exports: [AiTrackingService, QdrantService],
})
export class AiModule {}
