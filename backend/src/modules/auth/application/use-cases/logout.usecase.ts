import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from 'src/modules/auth/domain/repositories/iuser.repository';
import type { ILogoutUseCase } from '../interfaces/auth-usecase.interface';

@Injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this._userRepository.updateRefreshToken(userId, null);
  }
}
