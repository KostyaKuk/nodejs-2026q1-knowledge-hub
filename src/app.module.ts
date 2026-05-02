import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { CategoryModule } from './modules/category/category.module';
import { CommetsModule } from './modules/comments/comments.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    UserModule,
    ArticleModule,
    CategoryModule,
    CommetsModule,
    PrismaModule,
    AuthModule,
    AiModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: parseInt(process.env.AI_RATE_LIMIT_RPM || '20'),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
