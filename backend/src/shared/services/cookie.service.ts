import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { ICookieService } from 'src/shared/interfaces/cookie-service.interface';

@Injectable()
export class CookieService implements ICookieService {
  private readonly _isProduction: boolean;

  constructor(private readonly _configService: ConfigService) {
    this._isProduction = this._configService.get<string>('NODE_ENV') === 'production';
  }

  private get _cookieDomain(): string | undefined {
    const frontendUrl = this._configService.get<string>('FRONTEND_URL') || '';
    if (frontendUrl.includes('nidhintech.site')) {
      return '.nidhintech.site';
    }
    return undefined; // Localhost
  }

  setAccessToken(res: Response, token: string): void {
    const expiresIn = this._configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this._isProduction,
      sameSite: 'lax',
      domain: this._cookieDomain,
      maxAge: this._parseDurationToMs(expiresIn),
    });
  }

  setRefreshToken(res: Response, token: string): void {
    const expiresIn = this._configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this._isProduction,
      sameSite: 'lax',
      domain: this._cookieDomain,
      maxAge: this._parseDurationToMs(expiresIn),
      path: '/auth/refresh',
    });
  }

  clearTokens(res: Response): void {
    res.clearCookie('access_token', { domain: this._cookieDomain });
    res.clearCookie('refresh_token', { path: '/auth/refresh', domain: this._cookieDomain });
  }

  private _parseDurationToMs(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return (units[unit] ?? 1000) * value;
  }
}