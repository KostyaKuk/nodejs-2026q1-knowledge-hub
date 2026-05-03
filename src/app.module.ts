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
import { CacheModule } from '@nestjs/cache-manager';
import { AI_CONFIG } from './modules/ai/constants/ai-config.constants';

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
        name: 'ai',
        ttl: AI_CONFIG.rateLimitTtl,
        limit: AI_CONFIG.rateLimitLimit,
      },
    ]),
    CacheModule.register({
      ttl: AI_CONFIG.cacheTtlMs,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
