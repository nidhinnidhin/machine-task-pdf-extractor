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
        // 1. Cookie-based extraction (works on localhost — same domain)
        (request: Request): string | null => {
          return (request.cookies as Record<string, string | undefined>)['refresh_token'] ?? null;
        },
        // 2. Authorization header extraction (works in production — cross-domain)
        // When the frontend (Vercel) calls this endpoint, it passes the
        // refresh_token as "Authorization: Bearer <token>" because the cookie
        // is on a different domain and won't be sent automatically by the browser.
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: RefreshTokenPayload): RefreshTokenPayload & { refreshToken: string } {
    // Try cookie first (localhost), then Authorization header (cross-domain production)
    const refreshToken =
      (request.cookies as Record<string, string | undefined>)['refresh_token'] ??
      (request.headers['authorization']?.replace('Bearer ', '') ?? null);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return { ...payload, refreshToken };
  }
}
