import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, PrismaUserRepository],
})
export class UserModule {}
