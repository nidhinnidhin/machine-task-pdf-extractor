import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/modules/auth/infrastructure/database/prisma/prisma.service';
import type { IPdfDocumentRepository } from '../../../domain/repositories/ipdf-document.repository';
import { PdfDocumentEntity } from '../../../domain/entities/pdf-document.entity';
import { PdfDocumentMapper } from '../../../application/mappers/pdf-document.mapper';

@Injectable()
export class PrismaPdfDocumentRepository implements IPdfDocumentRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(pdf: PdfDocumentEntity): Promise<PdfDocumentEntity> {
    const created = await this._prisma.pdfDocument.create({
      data: {
        userId: pdf.userId,
        filename: pdf.filename,
        originalName: pdf.originalName,
        filePath: pdf.filePath,
        fileSize: pdf.fileSize,
        pageCount: pdf.pageCount,
        isGenerated: pdf.isGenerated,
      },
    });
    return PdfDocumentMapper.toDomain(created);
  }

  async findById(id: string): Promise<PdfDocumentEntity | null> {
    const doc = await this._prisma.pdfDocument.findUnique({
      where: { id },
    });
    return doc ? PdfDocumentMapper.toDomain(doc) : null;
  }

  async findAllByUserId(userId: string): Promise<PdfDocumentEntity[]> {
    const docs = await this._prisma.pdfDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map((doc) => PdfDocumentMapper.toDomain(doc));
  }
}
