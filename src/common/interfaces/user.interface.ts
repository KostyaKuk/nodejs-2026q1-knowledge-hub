import { UserRole } from '../enums/user-role';

export interface User {
  id: string;
  login: string;
  password: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}
