import type { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype: string;
}

export interface IUploadPdfUseCase {
  execute(userId: string, file: UploadedFile): Promise<PdfDocumentEntity>;
}

export interface IGetPdfUseCase {
  execute(userId: string, pdfId: string): Promise<PdfDocumentEntity>;
}

export interface IGetUserPdfsUseCase {
  execute(userId: string): Promise<PdfDocumentEntity[]>;
}

export interface IExtractPagesUseCase {
  execute(userId: string, pdfId: string, pageIndices: number[]): Promise<PdfDocumentEntity>;
}
