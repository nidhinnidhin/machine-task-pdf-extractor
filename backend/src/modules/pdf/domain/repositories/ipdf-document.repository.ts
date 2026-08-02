import type { PdfDocumentEntity } from '../entities/pdf-document.entity';

export interface IPdfDocumentRepository {
  create(pdf: PdfDocumentEntity): Promise<PdfDocumentEntity>;
  findById(id: string): Promise<PdfDocumentEntity | null>;
  findAllByUserId(userId: string): Promise<PdfDocumentEntity[]>;
}
