import { Injectable } from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { UserEntity } from '../entitties/user.entity';
import { UserRole } from '@/common/enums/user-role';
import { CreateUserDto } from '../dto/create-user.dto';

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

  createUser(dto: CreateUserDto): User {
    const newUser = new UserEntity({
      login: dto.login,
      password: dto.password,
      role: dto.role || UserRole.VIEWER,
    });

    this.users.push(newUser);
    return newUser;
  }

  updatePassword(id: string, newPassword: string): User | undefined {
    const user = this.findById(id);

    if (!user) {
      return undefined;
    }

    user.password = newPassword;
    user.updatedAt = Date.now();

    return user;
  }

  delete(id: string): boolean {
    const user = this.findById(id);

    if (!user) {
      return false;
    }

    const userIndex = this.users.indexOf(user);
    this.users.splice(userIndex, 1);
    return true;
  }
}
