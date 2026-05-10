import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmbeddingService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly embeddingModel: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.baseUrl = this.configService.get<string>(
      'GEMINI_API_BASE_URL',
      'https://generativelanguage.googleapis.com',
    );
    this.embeddingModel = this.configService.get<string>(
      'GEMINI_EMBEDDING_MODEL',
      'text-embedding-004',
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const url = `${this.baseUrl}/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;

    const body = {
      model: `models/${this.embeddingModel}`,
      content: {
        parts: [{ text: text.substring(0, 2000) }],
      },
    };

    try {
      console.log(
        '📤 Generating embedding for:',
        text.substring(0, 50) + '...',
      );

      const response = await firstValueFrom(
        this.httpService.post(url, body, { timeout: 30000 }),
      );

      const embedding = response.data.embedding?.values;
      if (!embedding) {
        throw new Error('No embedding returned');
      }

      console.log(`✅ Embedding generated, length: ${embedding.length}`);
      return embedding;
    } catch (error) {
      console.error('❌ Embedding error:', error);
      throw new ServiceUnavailableException('Embedding service is unavailable');
    }
  }
}
