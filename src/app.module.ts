import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { CategoryModule } from './modules/category/category.module';
import { CommetsModule } from './modules/comments/comments.module';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule, CommetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
