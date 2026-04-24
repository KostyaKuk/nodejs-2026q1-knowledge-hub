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
import { CreateCommentDto } from './dto/create-comments.dto';
import { IComment } from '@/common/interfaces/comment.interface';

@Controller('comment')
export class CommetsController {
  constructor(private readonly commetsService: CommentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findByArticleId(@Query() query: GetCommentsDto): Promise<IComment[]> {
    return this.commetsService.findByArticleId(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<IComment> {
    return this.commetsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto): Promise<IComment> {
    return this.commetsService.create(createCommentDto, null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.commetsService.delete(id);
  }
}
