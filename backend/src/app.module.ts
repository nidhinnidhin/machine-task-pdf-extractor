import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { PdfModule } from './modules/pdf/presentation/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PdfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

