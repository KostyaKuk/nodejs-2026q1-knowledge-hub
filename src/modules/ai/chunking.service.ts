import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TextChunk {
  id: number;
  text: string;
  index: number;
  start: number;
  end: number;
}

@Injectable()
export class ChunkingService {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private nextId: number = 1;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = this.configService.get<number>('RAG_CHUNK_SIZE') || 800;
    this.chunkOverlap =
      this.configService.get<number>('RAG_CHUNK_OVERLAP') || 200;
  }

  chunkText(text: string, _articleId: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const step = this.chunkSize - this.chunkOverlap;
    let chunkIndex = 0;

    for (let i = 0; i < text.length; i += step) {
      const start = i;
      let end = Math.min(i + this.chunkSize, text.length);

      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const lastSpace = text.lastIndexOf(' ', end);
        const breakPoint = Math.max(lastPeriod, lastNewline, lastSpace);

        if (breakPoint > i) {
          end = breakPoint + 1;
        }
      }

      const chunkText = text.substring(start, end).trim();

      if (chunkText.length > 0) {
        chunks.push({
          id: this.nextId++,
          text: chunkText,
          index: chunkIndex,
          start,
          end,
        });
        chunkIndex++;
      }

      if (end >= text.length) {
        break;
      }
    }

    return chunks;
  }

  resetIdCounter() {
    this.nextId = 1;
  }
}
