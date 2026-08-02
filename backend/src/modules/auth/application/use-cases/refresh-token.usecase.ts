import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import type { IUserRepository } from 'src/modules/auth/domain/repositories/iuser.repository';
import type { IRefreshTokenUseCase } from '../interfaces/auth-usecase.interface';
import type { ITokenService, TokenPair } from '../interfaces/token-service.interface';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth/auth.messages';

@Injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('ITokenService')
    private readonly _tokenService: ITokenService,
  ) {}

  async execute(userId: string, incomingRefreshToken: string): Promise<TokenPair> {
    const user = await this._userRepository.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const isTokenValid = await bcryptjs.compare(incomingRefreshToken, user.refreshToken);

    if (!isTokenValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const newAccessToken = this._tokenService.generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = this._tokenService.generateRefreshToken(user.id);

    const hashedNewRefreshToken = await bcryptjs.hash(newRefreshToken, 10);
    await this._userRepository.updateRefreshToken(user.id, hashedNewRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
