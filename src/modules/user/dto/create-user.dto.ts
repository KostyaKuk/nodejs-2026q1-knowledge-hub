import { UserRole } from '@/common/enums/user-role';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'login must be a string' })
  @IsNotEmpty({ message: 'Login is not empty' })
  @MinLength(3, { message: 'min length must have 3 symbol' })
  @MaxLength(50)
  login: string;

  @IsString({ message: 'passsword must be a string' })
  @IsNotEmpty({ message: 'Password is not empty' })
  @MinLength(6, { message: 'min length password must have 3 symbol' })
  password: string;

  @IsEnum(UserRole, { message: 'role must be: admin, editor или viewer' })
  @IsOptional()
  role?: UserRole;
}
