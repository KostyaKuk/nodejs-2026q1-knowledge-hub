import { randomUUID } from 'node:crypto';
import { UserRole } from '@/common/enums/user-role';
import { User } from '@/common/interfaces/user.interface';

export class UserEntity implements User {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;

  constructor(partial: Partial<UserEntity>) {
    this.id = partial.id || randomUUID();
    this.login = partial.login || '';
    this.password = partial.password || '';
    this.role = partial.role || UserRole.VIEWER;
    const now = Date.now();
    this.createdAt = partial.createdAt || now;
    this.updatedAt = partial.updatedAt || now;
  }
}
