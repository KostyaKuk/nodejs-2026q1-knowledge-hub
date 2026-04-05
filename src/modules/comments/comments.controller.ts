import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from './comments.service';
import { GetCommentsDto } from './dto/get-comments.dto';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comments.dto';
import { IComment } from '@/common/interfaces/comment.interface';

@Controller('comment')
export class CommetsController {
  constructor(private readonly commetsService: CommentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findByArticleId(@Query() query: GetCommentsDto): CommentEntity[] {
    return this.commetsService.findByArticleId(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseUUIDPipe) id: string): IComment {
    return this.commetsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCommentDto: CreateCommentDto): IComment {
    return this.commetsService.create(createCommentDto, null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): void {
    return this.commetsService.delete(id);
  }
}
