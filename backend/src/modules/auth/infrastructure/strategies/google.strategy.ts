import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback, type Profile } from 'passport-google-oauth20';
import type { GoogleProfileDto } from 'src/modules/auth/application/dto/google-profile.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly _configService: ConfigService) {
    super({
      clientID: _configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: _configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: _configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const googleProfile: GoogleProfileDto = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value ?? null,
    };
    done(null, googleProfile);
  }
}
