import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Middleware ────────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });

  await app.listen(process.env['PORT'] ?? 4000);
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});