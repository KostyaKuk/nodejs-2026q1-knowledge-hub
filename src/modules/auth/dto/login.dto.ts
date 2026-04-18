import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Login must be a string' })
  @IsNotEmpty({ message: 'Login is required' })
  @MinLength(3, { message: 'Login must be at least 3 characters long' })
  @MaxLength(50, { message: 'Login must not exceed 50 characters' })
  login: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;
}
