import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { IUserRepository } from 'src/modules/auth/domain/repositories/iuser.repository';
import type { UserEntity } from 'src/modules/auth/domain/entities/user.entity';
import type { IGetProfileUseCase } from '../interfaces/auth-usecase.interface';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth/auth.messages';

@Injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}
