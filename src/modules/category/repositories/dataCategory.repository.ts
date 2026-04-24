import { Injectable } from '@nestjs/common';
import { Category } from '@/common/interfaces/category.interface';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class dataCategoryRepo {
  private categories: Category[] = [
    new CategoryEntity({
      name: 'Technology',
      description: 'simple description about technology',
    }),
    new CategoryEntity({
      name: 'Science',
      description: 'Simple description',
    }),
  ];

  findAll(): Category[] {
    return [...this.categories];
  }

  findById(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  create(createCategoryDto: CreateCategoryDto): Category {
    const newCategory = new CategoryEntity({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    });

    this.categories.push(newCategory);
    return newCategory;
  }

  update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Category | undefined {
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id,
    );

    if (categoryIndex === -1) {
      return undefined;
    }

    const updatedCategory = {
      ...this.categories[categoryIndex],
      ...updateCategoryDto,
    };

    this.categories[categoryIndex] = updatedCategory;
    return updatedCategory;
  }

  delete(id: string): boolean {
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id,
    );

    if (categoryIndex === -1) {
      return false;
    }

    this.categories.splice(categoryIndex, 1);
    return true;
  }
}
