import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: {
    userId: string;
    login: string;
    role: string;
  }): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY || 'access-secret',
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: {
    userId: string;
    login: string;
    role: string;
  }): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_REFRESH_KEY || 'refresh-secret',
      expiresIn: '7d',
    });
  }

  verifyRefreshToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_REFRESH_KEY || 'refresh-secret',
      });
    } catch {
      return null;
    }
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY || 'access-secret',
      });
    } catch {
      return null;
    }
  }
}
