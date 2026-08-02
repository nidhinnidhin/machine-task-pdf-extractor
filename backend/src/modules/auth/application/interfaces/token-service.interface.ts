export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateAccessToken(userId: string, email: string, role: string): string;
  generateRefreshToken(userId: string): string;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}

export interface RefreshTokenPayload {
  userId: string;
}
