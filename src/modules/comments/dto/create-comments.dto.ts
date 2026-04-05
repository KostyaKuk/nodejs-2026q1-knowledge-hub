import { IsString, IsNotEmpty, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content must not be empty' })
  content: string;

  @IsUUID(4, { message: 'articleId must be a valid UUID' })
  @IsNotEmpty({ message: 'articleId is required' })
  articleId: string;
}
