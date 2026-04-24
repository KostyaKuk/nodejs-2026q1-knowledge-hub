import { Injectable } from '@nestjs/common';
import { Category } from '@/common/interfaces/category.interface';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaCategoryRepository {
  constructor(private prismaService: PrismaService) {}

  private toDomain(category: any): Category {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
    };
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prismaService.prisma.category.findMany();
    return categories.map((cat) => this.toDomain(cat));
  }

  async findById(id: string): Promise<Category | undefined> {
    const category = await this.prismaService.prisma.category.findUnique({
      where: { id },
    });
    return category ? this.toDomain(category) : undefined;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = await this.prismaService.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      },
    });
    return this.toDomain(newCategory);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | undefined> {
    try {
      const updatedCategory = await this.prismaService.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
          description: updateCategoryDto.description,
        },
      });
      return this.toDomain(updatedCategory);
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prismaService.prisma.category.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
