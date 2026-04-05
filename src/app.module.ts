import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
