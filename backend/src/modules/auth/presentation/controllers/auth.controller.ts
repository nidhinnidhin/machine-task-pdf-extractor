import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/shared/types/express/authenticated-request.interface';
import { ResponseHelper } from 'src/shared/helpers/response.helper';
import { AUTH_MESSAGES } from 'src/shared/constants/messages/auth/auth.messages';
import type { ICookieService } from 'src/shared/interfaces/cookie-service.interface';

import type { IGoogleLoginUseCase, IRefreshTokenUseCase, ILogoutUseCase, IGetProfileUseCase } from '../../application/interfaces/auth-usecase.interface';
import type { GoogleProfileDto } from '../../application/dto/google-profile.dto';
import type { RefreshTokenRequest } from '../../infrastructure/strategies/jwt-refresh.strategy';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IGoogleLoginUseCase')
    private readonly _googleLoginUseCase: IGoogleLoginUseCase,

    @Inject('IRefreshTokenUseCase')
    private readonly _refreshTokenUseCase: IRefreshTokenUseCase,

    @Inject('ILogoutUseCase')
    private readonly _logoutUseCase: ILogoutUseCase,

    @Inject('IGetProfileUseCase')
    private readonly _getProfileUseCase: IGetProfileUseCase,

    @Inject('ICookieService')
    private readonly _cookieService: ICookieService,

    private readonly _configService: ConfigService,
  ) {}

  // ─── GET /auth/google ─────────────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  initiateGoogleLogin(): void {
    // Passport redirects to Google — no body needed
  }

  // ─── GET /auth/google/callback ────────────────────────────────────────────
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async handleGoogleCallback(
    @Req() req: AuthenticatedRequest & { user: GoogleProfileDto },
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this._googleLoginUseCase.execute(req.user);

    this._cookieService.setAccessToken(res, accessToken);
    this._cookieService.setRefreshToken(res, refreshToken);

    const clientRedirectUrl = this._configService.get<string>('CLIENT_REDIRECT_URL') ?? 'http://localhost:3000/dashboard';
    res.redirect(clientRedirectUrl);
  }

  // ─── POST /auth/refresh ───────────────────────────────────────────────────
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: RefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, refreshToken } = req.user;

    const { accessToken, refreshToken: newRefreshToken } = await this._refreshTokenUseCase.execute(userId, refreshToken);

    this._cookieService.setAccessToken(res, accessToken);
    this._cookieService.setRefreshToken(res, newRefreshToken);

    return ResponseHelper.success(null, AUTH_MESSAGES.TOKEN_REFRESHED);
  }

  // ─── POST /auth/logout ────────────────────────────────────────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this._logoutUseCase.execute(req.user.userId);
    this._cookieService.clearTokens(res);

    return ResponseHelper.success(null, AUTH_MESSAGES.LOGOUT_SUCCESS);
  }

  // ─── GET /auth/profile ────────────────────────────────────────────────────
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this._getProfileUseCase.execute(req.user.userId);

    return ResponseHelper.success(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      AUTH_MESSAGES.PROFILE_FETCHED,
    );
  }
}
