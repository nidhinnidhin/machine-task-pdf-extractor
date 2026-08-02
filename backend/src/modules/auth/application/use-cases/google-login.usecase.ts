import { Inject, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import type { IUserRepository } from 'src/modules/auth/domain/repositories/iuser.repository';
import { UserEntity } from 'src/modules/auth/domain/entities/user.entity';
import { UserRole } from 'src/modules/auth/domain/enums/user-role.enum';

import type { IGoogleLoginUseCase } from '../interfaces/auth-usecase.interface';
import type { ITokenService, TokenPair } from '../interfaces/token-service.interface';
import type { GoogleProfileDto } from '../dto/google-profile.dto';

@Injectable()
export class GoogleLoginUseCase implements IGoogleLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('ITokenService')
    private readonly _tokenService: ITokenService,
  ) {}

  async execute(profile: GoogleProfileDto): Promise<TokenPair> {
    let user = await this._userRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const newUser = new UserEntity(
        '',
        profile.googleId,
        profile.email,
        profile.name,
        UserRole.USER,
        profile.avatar,
        null,
        new Date(),
        new Date(),
      );
      user = await this._userRepository.create(newUser);
    }

    const accessToken = this._tokenService.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this._tokenService.generateRefreshToken(user.id);

    const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
    await this._userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }
}
