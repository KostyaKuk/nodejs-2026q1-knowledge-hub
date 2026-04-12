import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { Category } from '@/common/interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepo: PrismaCategoryRepository) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with "${id}" not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepo.create(createCategoryDto);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryRepo.update(
      id,
      updateCategoryDto,
    );

    if (!updatedCategory) {
      throw new NotFoundException(`Category with "${id}" not found`);
    }
    return updatedCategory;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.categoryRepo.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Category with "${id}" not found`);
    }
  }
}
