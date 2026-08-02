import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

import type { ITokenService, RefreshTokenPayload } from 'src/modules/auth/application/interfaces/token-service.interface';
import type { JwtPayload } from 'src/shared/types/express/authenticated-request.interface';
import type { UserRole } from 'src/modules/auth/domain/enums/user-role.enum';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  generateAccessToken(userId: string, email: string, role: string): string {
    const payload: JwtPayload = { userId, email, role: role as UserRole };
    return this._jwtService.sign(payload, {
      secret: this._configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this._configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as StringValue,
    });
  }

  generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = { userId };
    return this._jwtService.sign(payload, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this._configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as StringValue,
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this._jwtService.verify<RefreshTokenPayload>(token, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
