export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
