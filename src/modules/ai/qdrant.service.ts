import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly collectionName =
    process.env.QDRANT_COLLECTION || 'knowledge_hub_articles';
  private readonly vectorSize = 3072;

  constructor() {
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    this.client = new QdrantClient({ url });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        console.log(`✅ Created Qdrant collection: ${this.collectionName}`);
      } else {
        console.log(
          `✅ Qdrant collection already exists: ${this.collectionName}`,
        );
      }
    } catch (error) {
      console.error('Failed to ensure Qdrant collection:', error);
    }
  }

  async upsertPoint(id: string, vector: number[], payload: any): Promise<void> {
    await this.client.upsert(this.collectionName, {
      points: [{ id, vector, payload }],
    });
  }

  async deletePoints(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.client.delete(this.collectionName, {
      points: ids,
    });
  }

  async search(vector: number[], limit: number = 5): Promise<any[]> {
    const result = await this.client.search(this.collectionName, {
      vector,
      limit,
      with_payload: true,
    });
    return result;
  }

  async getCollectionInfo(): Promise<any> {
    return await this.client.getCollection(this.collectionName);
  }

  async deleteCollection(): Promise<void> {
    await this.client.deleteCollection(this.collectionName);
  }

  async searchWithFilters(
    vector: number[],
    limit: number = 5,
    filters?: {
      articleStatus?: string;
      categoryId?: string;
      tags?: string[];
    },
  ): Promise<any[]> {
    const filterConditions: any[] = [];

    if (filters?.articleStatus) {
      filterConditions.push({
        key: 'status',
        match: { value: filters.articleStatus },
      });
    }

    if (filters?.categoryId) {
      filterConditions.push({
        key: 'categoryId',
        match: { value: filters.categoryId },
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      filterConditions.push({
        key: 'tags',
        match: { any: filters.tags },
      });
    }

    const filter =
      filterConditions.length > 0 ? { must: filterConditions } : undefined;

    const result = await this.client.search(this.collectionName, {
      vector,
      limit,
      with_payload: true,
      filter,
    });

    return result;
  }
}
