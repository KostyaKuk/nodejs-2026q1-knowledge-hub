import { Injectable } from '@nestjs/common';
import { User } from '@/common/interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { User as PrismaUser, $Enums } from '@prisma/client';
import { UserRole } from '@/common/enums/user-role';

@Injectable()
export class PrismaUserRepository {
  constructor(private prismaService: PrismaService) {}

  private toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      login: prismaUser.login,
      password: prismaUser.password,
      role: prismaUser.role as unknown as UserRole,
      createdAt: prismaUser.createdAt.getTime(),
      updatedAt: prismaUser.updatedAt.getTime(),
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.prismaService.prisma.user.findMany();
    return users.map((user) => this.toDomain(user));
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toDomain(user) : undefined;
  }

  async findByLogin(login: string): Promise<User | undefined> {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { login },
    });
    return user ? this.toDomain(user) : undefined;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const role = dto.role as $Enums.UserRole;

    const newUser = await this.prismaService.prisma.user.create({
      data: {
        login: dto.login,
        password: dto.password,
        role: role || $Enums.UserRole.VIEWER,
      },
    });
    return this.toDomain(newUser);
  }

  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<User | undefined> {
    try {
      const updatedUser = await this.prismaService.prisma.user.update({
        where: { id },
        data: {
          password: newPassword,
          updatedAt: new Date(),
        },
      });
      return this.toDomain(updatedUser);
    } catch {
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prismaService.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
