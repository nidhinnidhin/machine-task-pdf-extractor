import type { Response } from 'express';

export interface ICookieService {
  setAccessToken(res: Response, token: string): void;
  setRefreshToken(res: Response, token: string): void;
  clearTokens(res: Response): void;
}
