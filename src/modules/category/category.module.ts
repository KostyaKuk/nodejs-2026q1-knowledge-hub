import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService, PrismaCategoryRepository],
})
export class CategoryModule {}
