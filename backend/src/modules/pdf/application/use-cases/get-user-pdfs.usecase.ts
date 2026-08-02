import { Inject, Injectable } from '@nestjs/common';

import type { IGetUserPdfsUseCase } from '../interfaces/pdf-usecase.interface';
import type { IPdfDocumentRepository } from '../../domain/repositories/ipdf-document.repository';
import type { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

@Injectable()
export class GetUserPdfsUseCase implements IGetUserPdfsUseCase {
  constructor(
    @Inject('IPdfDocumentRepository')
    private readonly _pdfRepository: IPdfDocumentRepository,
  ) {}

  async execute(userId: string): Promise<PdfDocumentEntity[]> {
    return await this._pdfRepository.findAllByUserId(userId);
  }
}
