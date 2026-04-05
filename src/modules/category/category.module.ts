import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { dataCategoryRepo } from './repositories/dataCategory.repository';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, dataCategoryRepo],
})
export class CategoryModule {}
