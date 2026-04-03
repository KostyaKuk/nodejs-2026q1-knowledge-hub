import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { DataUsersRepo } from './repositories/dataUser.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: DataUsersRepo) {}

  findAll(): User[] {
    return this.userRepository.findAll();
  }

  findById(id: string): User {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with "${id}" not found`);
    }
    return user;
  }

  createUser(dto: CreateUserDto): User{
    return this.userRepository.createUser(dto);
  }
}
