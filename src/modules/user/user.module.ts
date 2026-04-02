import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DataUsersRepo } from './repositories/dataUser.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, DataUsersRepo],
})
export class UserModule {}
