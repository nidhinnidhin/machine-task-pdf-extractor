import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { IUserRepository } from 'src/modules/auth/domain/repositories/iuser.repository';
import { UserEntity } from 'src/modules/auth/domain/entities/user.entity';
import { UserMapper } from 'src/modules/auth/application/mappers/user.mapper';
import type { UserRole } from 'src/modules/auth/domain/enums/user-role.enum';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this._prisma.user.findUnique({ where: { googleId } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this._prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this._prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this._prisma.user.create({
      data: {
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        refreshToken: user.refreshToken,
        role: user.role,
      },
    });
    return UserMapper.toDomain(created);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this._prisma.user.update({
      where: { id },
      data: { refreshToken: token },
    });
  }

  async updateUserFieldsById(
    id: string,
    fields: Partial<Pick<UserEntity, 'refreshToken' | 'avatar' | 'name' | 'role'>>,
  ): Promise<void> {
    await this._prisma.user.update({
      where: { id },
      data: {
        ...(fields.refreshToken !== undefined && { refreshToken: fields.refreshToken }),
        ...(fields.avatar !== undefined && { avatar: fields.avatar }),
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.role !== undefined && { role: fields.role as UserRole }),
      },
    });
  }
}
