import type { UserRole } from '../enums/user-role.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly googleId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly avatar: string | null,
    public readonly refreshToken: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
