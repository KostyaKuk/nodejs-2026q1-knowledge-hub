import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  // Количество раундов хеширования (10-12 оптимально)
  private readonly SALT_ROUNDS = 10;

  async signup(
    signupDto: SignupDto,
  ): Promise<{ message: string; userId: string }> {
    const { login, password } = signupDto;

    // 1. Проверяем, существует ли пользователь с таким login
    const existingUser = await this.prismaService.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new ConflictException(`User with login "${login}" already exists`);
    }

    // 2. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 3. Создаём пользователя
    const newUser = await this.prismaService.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        role: 'VIEWER', // По умолчанию обычный пользователь
      },
    });

    // 4. Возвращаем успешный ответ (без пароля)
    return {
      message: 'User successfully registered',
      userId: newUser.id,
    };
  }
}
