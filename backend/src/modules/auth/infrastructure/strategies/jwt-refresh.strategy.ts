import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import type { RefreshTokenPayload } from 'src/modules/auth/application/interfaces/token-service.interface';

export interface RefreshTokenRequest extends Request {
  user: RefreshTokenPayload & { refreshToken: string };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          return (request.cookies as Record<string, string | undefined>)['refresh_token'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: RefreshTokenPayload): RefreshTokenPayload & { refreshToken: string } {
    const refreshToken = (request.cookies as Record<string, string | undefined>)['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }

    return { ...payload, refreshToken };
  }
}
