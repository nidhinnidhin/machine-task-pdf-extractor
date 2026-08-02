import type { UserEntity } from 'src/modules/auth/domain/entities/user.entity';
import type { GoogleProfileDto } from '../dto/google-profile.dto';
import type { TokenPair } from './token-service.interface';

export interface IGoogleLoginUseCase {
  execute(profile: GoogleProfileDto): Promise<TokenPair>;
}

export interface IRefreshTokenUseCase {
  execute(userId: string, refreshToken: string): Promise<TokenPair>;
}

export interface ILogoutUseCase {
  execute(userId: string): Promise<void>;
}

export interface IGetProfileUseCase {
  execute(userId: string): Promise<UserEntity>;
}
