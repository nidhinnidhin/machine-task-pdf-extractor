import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { IUploadPdfUseCase, UploadedFile } from '../interfaces/pdf-usecase.interface';
import type { IPdfService } from '../interfaces/pdf-service.interface';
import type { IPdfDocumentRepository } from '../../domain/repositories/ipdf-document.repository';
import type { IStorageService } from '../interfaces/storage-service.interface';
import { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

@Injectable()
export class UploadPdfUseCase implements IUploadPdfUseCase {
  constructor(
    @Inject('IPdfDocumentRepository')
    private readonly _pdfRepository: IPdfDocumentRepository,

    @Inject('IPdfService')
    private readonly _pdfService: IPdfService,

    @Inject('IStorageService')
    private readonly _storageService: IStorageService,
  ) {}

  async execute(userId: string, file: UploadedFile): Promise<PdfDocumentEntity> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Invalid file type. Only PDF files are allowed.');
    }

    const fileExtension = '.pdf';
    const uniqueFilename = `${randomUUID()}${fileExtension}`;

    try {
      // Save file using the storage service
      const filePath = await this._storageService.save(uniqueFilename, file.buffer, file.mimetype);

      // Get page count using PdfService
      const pageCount = await this._pdfService.getPageCount(file.buffer);

      const pdfEntity = new PdfDocumentEntity(
        '', // database will generate uuid
        userId,
        uniqueFilename,
        file.originalname,
        filePath,
        file.size,
        pageCount,
        false, // isGenerated = false
        new Date(),
        new Date(),
      );

      return await this._pdfRepository.create(pdfEntity);
    } catch (error: unknown) {
      // Clean up file if DB save or page parsing fails
      try {
        await this._storageService.delete(uniqueFilename);
      } catch {
        // Ignore file cleanup failure if it wasn't written
      }
      if (error instanceof Error) {
        throw new BadRequestException(`Failed to process PDF: ${error.message}`);
      }
      throw new BadRequestException('Failed to process PDF file.');
    }
  }
}
