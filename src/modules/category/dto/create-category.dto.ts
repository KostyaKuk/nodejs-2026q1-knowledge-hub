import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message to require' })
  @MinLength(2, { message: 'message have to  min 2 symbols' })
  name: string;

  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'desruption to require' })
  @MinLength(2, { message: 'message have to  min 2 symbols' })
  description: string;
}
