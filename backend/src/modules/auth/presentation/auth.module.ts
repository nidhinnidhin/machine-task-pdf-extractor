import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

// ─── Presentation ──────────────────────────────────────────────────────────
import { AuthController } from './controllers/auth.controller';

// ─── Infrastructure: Repository ────────────────────────────────────────────
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { PrismaUserRepository } from '../infrastructure/database/repositories/prisma-user.repository';

// ─── Infrastructure: Services & Strategies ─────────────────────────────────
import { JwtTokenService } from '../infrastructure/services/jwt-token.service';
import { GoogleStrategy } from '../infrastructure/strategies/google.strategy';
import { JwtStrategy } from '../infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../infrastructure/strategies/jwt-refresh.strategy';

// ─── Application: Use Cases ────────────────────────────────────────────────
import { GoogleLoginUseCase } from '../application/use-cases/google-login.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { LogoutUseCase } from '../application/use-cases/logout.usecase';
import { GetProfileUseCase } from '../application/use-cases/get-profile.usecase';

// ─── Shared ────────────────────────────────────────────────────────────────
import { CookieService } from 'src/shared/services/cookie.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // ─── Infrastructure ─────────────────────────────────────────────────
    PrismaService,
    GoogleStrategy,
    JwtStrategy,
    JwtRefreshStrategy,

    // ─── Repository binding (DIP) ────────────────────────────────────────
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },

    // ─── Token service binding (DIP) ─────────────────────────────────────
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },

    // ─── Cookie service binding (DIP) ────────────────────────────────────
    {
      provide: 'ICookieService',
      useClass: CookieService,
    },

    // ─── Use case bindings (DIP) ─────────────────────────────────────────
    {
      provide: 'IGoogleLoginUseCase',
      useClass: GoogleLoginUseCase,
    },
    {
      provide: 'IRefreshTokenUseCase',
      useClass: RefreshTokenUseCase,
    },
    {
      provide: 'ILogoutUseCase',
      useClass: LogoutUseCase,
    },
    {
      provide: 'IGetProfileUseCase',
      useClass: GetProfileUseCase,
    },
  ],
  exports: [
    'IUserRepository',
    PrismaService,
    JwtModule,
  ],
})
export class AuthModule {}
