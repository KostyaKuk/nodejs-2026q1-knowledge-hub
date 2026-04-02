import { Injectable } from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { UserEntity } from '../entitties/user.entity';
import { UserRole } from '@/common/enums/user-role';

@Injectable()
export class DataUsersRepo {
  private users: User[] = [
    new UserEntity({
      login: 'hello@gmail.com',
      password: 'hello',
      role: UserRole.EDITOR,
    }),
    new UserEntity({
      login: 'hello2@gmail.com',
      password: 'hello2',
      role: UserRole.VIEWER,
    }),
  ];

  findAll(): User[] {
    return [...this.users];
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
