import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthModule } from '../../auth/presentation/auth.module';
import { PdfController } from './controllers/pdf.controller';

// ─── Infrastructure ──────────────────────────────────────────────────────────
import { PdfLibService } from '../infrastructure/services/pdf-lib.service';
import { PrismaPdfDocumentRepository } from '../infrastructure/database/repositories/prisma-pdf-document.repository';
import { DiskStorageService } from '../infrastructure/services/disk-storage.service';
import { S3StorageService } from '../infrastructure/services/s3-storage.service';

// ─── Application: Use Cases ────────────────────────────────────────────────
import { UploadPdfUseCase } from '../application/use-cases/upload-pdf.usecase';
import { GetPdfUseCase } from '../application/use-cases/get-pdf.usecase';
import { GetUserPdfsUseCase } from '../application/use-cases/get-user-pdfs.usecase';
import { ExtractPagesUseCase } from '../application/use-cases/extract-pages.usecase';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [PdfController],
  providers: [
    // ─── Storage Service (SOLID toggleable implementation) ─────────────────
    {
      provide: 'IStorageService',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('STORAGE_PROVIDER');
        return provider === 's3'
          ? new S3StorageService(configService)
          : new DiskStorageService();
      },
      inject: [ConfigService],
    },

    // ─── Infrastructure Services ───────────────────────────────────────────
    {
      provide: 'IPdfService',
      useClass: PdfLibService,
    },
    {
      provide: 'IPdfDocumentRepository',
      useClass: PrismaPdfDocumentRepository,
    },

    // ─── Application Use Cases ─────────────────────────────────────────────
    {
      provide: 'IUploadPdfUseCase',
      useClass: UploadPdfUseCase,
    },
    {
      provide: 'IGetPdfUseCase',
      useClass: GetPdfUseCase,
    },
    {
      provide: 'IGetUserPdfsUseCase',
      useClass: GetUserPdfsUseCase,
    },
    {
      provide: 'IExtractPagesUseCase',
      useClass: ExtractPagesUseCase,
    },
  ],
})
export class PdfModule {}
