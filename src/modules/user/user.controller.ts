import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@/common/interfaces/user.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private excludePassword(user: User): Omit<User, 'password'> {
    const { password: _password, ...result } = user;
    return result;
  }

  @Roles('ADMIN', 'EDITOR', 'VIEWER')
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => this.excludePassword(user));
  }

  @Roles('ADMIN', 'EDITOR', 'VIEWER')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findById(id);
    return this.excludePassword(user);
  }

  @Roles('ADMIN', 'EDITOR')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return this.excludePassword(user);
  }

  @Roles('ADMIN', 'EDITOR')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    const user = await this.userService.updatePassword(id, dto);
    return this.excludePassword(user);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
