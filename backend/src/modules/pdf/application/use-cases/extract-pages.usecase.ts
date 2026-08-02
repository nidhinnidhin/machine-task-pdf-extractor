import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import type { IExtractPagesUseCase } from '../interfaces/pdf-usecase.interface';
import type { IPdfService } from '../interfaces/pdf-service.interface';
import type { IPdfDocumentRepository } from '../../domain/repositories/ipdf-document.repository';
import type { IStorageService } from '../interfaces/storage-service.interface';
import { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

@Injectable()
export class ExtractPagesUseCase implements IExtractPagesUseCase {
  constructor(
    @Inject('IPdfDocumentRepository')
    private readonly _pdfRepository: IPdfDocumentRepository,

    @Inject('IPdfService')
    private readonly _pdfService: IPdfService,

    @Inject('IStorageService')
    private readonly _storageService: IStorageService,
  ) {}

  async execute(userId: string, pdfId: string, pageIndices: number[]): Promise<PdfDocumentEntity> {
    if (!pageIndices || pageIndices.length === 0) {
      throw new BadRequestException('At least one page must be selected for extraction.');
    }

    const originalPdf = await this._pdfRepository.findById(pdfId);

    if (!originalPdf) {
      throw new NotFoundException('Original PDF document not found.');
    }

    if (originalPdf.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this PDF document.');
    }

    // Validate page indices
    const maxIndex = originalPdf.pageCount - 1;
    for (const index of pageIndices) {
      if (index < 0 || index > maxIndex) {
        throw new BadRequestException(`Invalid page index: ${index}. Total pages in original PDF is ${originalPdf.pageCount}.`);
      }
    }

    const uniqueFilename = `extracted-${randomUUID()}.pdf`;

    try {
      // Read original PDF from storage
      const originalBuffer = await this._storageService.get(originalPdf.filePath);

      // Extract and rearrange pages
      const newBuffer = await this._pdfService.extractAndReorderPages(originalBuffer, pageIndices);

      // Write new PDF to storage
      const filePath = await this._storageService.save(uniqueFilename, newBuffer, 'application/pdf');

      const generatedPdfEntity = new PdfDocumentEntity(
        '', // database will generate uuid
        userId,
        uniqueFilename,
        `Extracted from ${originalPdf.originalName} (${pageIndices.length} pages)`,
        filePath,
        newBuffer.length,
        pageIndices.length,
        true, // isGenerated = true
        new Date(),
        new Date(),
      );

      return await this._pdfRepository.create(generatedPdfEntity);
    } catch (error: unknown) {
      // Clean up file if anything failed
      try {
        await this._storageService.delete(uniqueFilename);
      } catch {
        // Ignore file cleanup failure
      }
      if (error instanceof Error) {
        throw new BadRequestException(`Failed to extract pages: ${error.message}`);
      }
      throw new BadRequestException('Failed to extract pages from PDF.');
    }
  }
}
