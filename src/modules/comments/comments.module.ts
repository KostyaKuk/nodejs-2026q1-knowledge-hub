import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommetsController } from './comments.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaCommentRepository } from './repositories/prisma-comment.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommetsController],
  providers: [CommentService, PrismaCommentRepository],
})
export class CommetsModule {}
