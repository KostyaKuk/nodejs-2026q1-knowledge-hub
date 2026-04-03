import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { DataUsersRepo } from './repositories/dataUser.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

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

  createUser(dto: CreateUserDto): User {
    return this.userRepository.createUser(dto);
  }

  updatePassword(id: string, dto: UpdatePasswordDto): User | undefined {
    const user = this.findById(id);

    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password incorrect');
    }

    if (user.password === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const updateUser = this.userRepository.updatePassword(id, dto.newPassword);
    return updateUser;
  }

  deleteUser(id: string): void {
    this.findById(id);

    const deleted = this.userRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`User with "${id}" not found`);
    }
  }
}
