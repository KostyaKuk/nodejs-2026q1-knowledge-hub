import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommetsController } from './comments.controller';
import { CommetsRepo } from './repositories/dataCommets.repository';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [ArticleModule],
  controllers: [CommetsController],
  providers: [CommentService, CommetsRepo],
})
export class CommetsModule {}
