import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetCommentsDto {
  @IsUUID(4, { message: 'articleId must be valid UUID' })
  @IsNotEmpty({ message: 'articleId to require' })
  articleId: string;
}
