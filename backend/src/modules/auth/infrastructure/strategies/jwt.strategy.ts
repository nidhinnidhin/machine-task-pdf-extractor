import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload } from 'src/shared/types/express/authenticated-request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Cookie-based extraction (works on localhost — same domain)
        (request: Request): string | null => {
          return (request.cookies as Record<string, string | undefined>)['access_token'] ?? null;
        },
        // 2. Authorization header extraction (works in production — cross-domain)
        // In production, the accexcxcdgss_token cookie is on the Vercel domain and
        // cannot be sent to the AWS backend automatically. The frontend reads it
        // from document.cookie and attaches it as "Authorization: Bearer <token>".
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
