import { Injectable, NotFoundException } from '@nestjs/common';
import { dataCategoryRepo } from './repositories/dataCategory.repository';
import { Category } from '@/common/interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepo: dataCategoryRepo) {}

  findAll(): Category[] {
    return this.categoryRepo.findAll();
  }

  findOne(id: string): Category {
    const category = this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with "${id}" not found`);
    }

    return category;
  }

  create(createCategoryDto: CreateCategoryDto): Category {
    return this.categoryRepo.create(createCategoryDto);
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto): Category {
    const updatedCategory = this.categoryRepo.update(id, updateCategoryDto);

    if (!updatedCategory) {
      throw new NotFoundException(`Cattegory with  "${id}" not found`);
    }
    return updatedCategory;
  }

  delete(id: string): void {
    const deleted = this.categoryRepo.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Cattegory with  "${id}" not found`);
    }
  }
}
