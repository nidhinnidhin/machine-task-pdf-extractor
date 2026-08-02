import type { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
  updateUserFieldsById(id: string, fields: Partial<Pick<UserEntity, 'refreshToken' | 'avatar' | 'name' | 'role'>>): Promise<void>;
}
