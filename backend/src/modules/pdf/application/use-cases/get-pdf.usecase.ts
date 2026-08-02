import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import type { IGetPdfUseCase } from '../interfaces/pdf-usecase.interface';
import type { IPdfDocumentRepository } from '../../domain/repositories/ipdf-document.repository';
import type { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

@Injectable()
export class GetPdfUseCase implements IGetPdfUseCase {
  constructor(
    @Inject('IPdfDocumentRepository')
    private readonly _pdfRepository: IPdfDocumentRepository,
  ) {}

  async execute(userId: string, pdfId: string): Promise<PdfDocumentEntity> {
    const pdf = await this._pdfRepository.findById(pdfId);

    if (!pdf) {
      throw new NotFoundException('PDF document not found.');
    }

    if (pdf.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this PDF document.');
    }

    return pdf;
  }
}
