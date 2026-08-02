import type { PdfDocument as PrismaPdf } from '@prisma/client';
import { PdfDocumentEntity } from '../../domain/entities/pdf-document.entity';

export class PdfDocumentMapper {
  static toDomain(doc: PrismaPdf): PdfDocumentEntity {
    return new PdfDocumentEntity(
      doc.id,
      doc.userId,
      doc.filename,
      doc.originalName,
      doc.filePath,
      doc.fileSize,
      doc.pageCount,
      doc.isGenerated,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  static toPersistence(entity: PdfDocumentEntity): PrismaPdf {
    return {
      id: entity.id,
      userId: entity.userId,
      filename: entity.filename,
      originalName: entity.originalName,
      filePath: entity.filePath,
      fileSize: entity.fileSize,
      pageCount: entity.pageCount,
      isGenerated: entity.isGenerated,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
