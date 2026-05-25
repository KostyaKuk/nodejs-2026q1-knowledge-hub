import { Injectable } from '@nestjs/common';

export interface TrackingStats {
  totalRequests: number;
  byEndpoint: {
    summarize: number;
    translate: number;
    analyze: number;
    generate: number;
  };
  tokenUsage?: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AiTrackingService {
  private stats: TrackingStats = {
    totalRequests: 0,
    byEndpoint: {
      summarize: 0,
      translate: 0,
      analyze: 0,
      generate: 0,
    },
    tokenUsage: {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
    },
  };

  incrementSummarize(promptTokens?: number, completionTokens?: number): void {
    this.stats.totalRequests++;
    this.stats.byEndpoint.summarize++;

    if (promptTokens && completionTokens) {
      this.stats.tokenUsage.totalPromptTokens += promptTokens;
      this.stats.tokenUsage.totalCompletionTokens += completionTokens;
      this.stats.tokenUsage.totalTokens += promptTokens + completionTokens;
    }
  }

  incrementTranslate(promptTokens?: number, completionTokens?: number): void {
    this.stats.totalRequests++;
    this.stats.byEndpoint.translate++;

    if (promptTokens && completionTokens) {
      this.stats.tokenUsage.totalPromptTokens += promptTokens;
      this.stats.tokenUsage.totalCompletionTokens += completionTokens;
      this.stats.tokenUsage.totalTokens += promptTokens + completionTokens;
    }
  }

  incrementAnalyze(promptTokens?: number, completionTokens?: number): void {
    this.stats.totalRequests++;
    this.stats.byEndpoint.analyze++;

    if (promptTokens && completionTokens) {
      this.stats.tokenUsage.totalPromptTokens += promptTokens;
      this.stats.tokenUsage.totalCompletionTokens += completionTokens;
      this.stats.tokenUsage.totalTokens += promptTokens + completionTokens;
    }
  }

  getStats(): TrackingStats {
    return {
      totalRequests: this.stats.totalRequests,
      byEndpoint: { ...this.stats.byEndpoint },
      tokenUsage: this.stats.tokenUsage
        ? { ...this.stats.tokenUsage }
        : undefined,
    };
  }
}
