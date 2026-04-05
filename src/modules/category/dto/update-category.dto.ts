import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message to require' })
  @MinLength(2, { message: 'message have to  min 2 symbols' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'desruption to require' })
  @MinLength(2, { message: 'message have to  min 2 symbols' })
  description?: string;
}
