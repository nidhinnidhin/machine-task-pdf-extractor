import type { User as PrismaUser } from '@prisma/client';
import { UserEntity } from 'src/modules/auth/domain/entities/user.entity';
import { UserRole } from 'src/modules/auth/domain/enums/user-role.enum';

export class UserMapper {
  static toDomain(doc: PrismaUser): UserEntity {
    return new UserEntity(
      doc.id,
      doc.googleId,
      doc.email,
      doc.name,
      doc.role as UserRole,
      doc.avatar,
      doc.refreshToken,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  static toPersistence(entity: UserEntity): Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      googleId: entity.googleId,
      email: entity.email,
      name: entity.name,
      avatar: entity.avatar,
      refreshToken: entity.refreshToken,
      role: entity.role,
    };
  }
}
