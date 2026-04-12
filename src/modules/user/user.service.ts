import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: PrismaUserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with "${id}" not found`);
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByLogin(dto.login);
    if (existingUser) {
      throw new BadRequestException(
        `User with login "${dto.login}" already exists`,
      );
    }
    return this.userRepository.createUser(dto);
  }

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<User> {
    const user = await this.findById(id);

    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password incorrect');
    }

    if (user.password === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    const updatedUser = await this.userRepository.updatePassword(
      id,
      dto.newPassword,
    );
    if (!updatedUser) {
      throw new NotFoundException(`User with "${id}" not found`);
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.findById(id);

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with "${id}" not found`);
    }
  }
}
