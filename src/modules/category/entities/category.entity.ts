import { Category } from '@/common/interfaces/category.interface';
import { randomUUID } from 'node:crypto';

export class CategoryEntity implements Category {
  id: string;
  name: string;
  description: string;

  constructor(partial: Partial<CategoryEntity>) {
    this.id = partial.id || randomUUID();
    this.name = partial.name || '';
    this.description = partial.description || '';
  }
}
