import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { TokenService } from './token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private tokenService: TokenService,
  ) {}

  private readonly SALT_ROUNDS = 10;

  async signup(
    signupDto: SignupDto,
  ): Promise<{ message: string; userId: string }> {
    const { login, password } = signupDto;

    const existingUser = await this.prismaService.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new ConflictException(`User with login "${login}" already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const newUser = await this.prismaService.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        role: 'VIEWER',
      },
    });

    return {
      message: 'User successfully registered',
      userId: newUser.id,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { login, password } = loginDto;

    const user = await this.prismaService.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid login or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid login or password');
    }

    const payload = {
      userId: user.id,
      login: user.login,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    refreshDto: RefreshDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshDto;

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prismaService.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new ForbiddenException('User no longer exists');
    }

    const newPayload = {
      userId: user.id,
      login: user.login,
      role: user.role,
    };

    const newAccessToken = this.tokenService.generateAccessToken(newPayload);
    const newRefreshToken = this.tokenService.generateRefreshToken(newPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
