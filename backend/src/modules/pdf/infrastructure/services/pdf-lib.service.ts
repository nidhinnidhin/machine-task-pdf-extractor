import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

import type { IPdfService } from '../../application/interfaces/pdf-service.interface';

@Injectable()
export class PdfLibService implements IPdfService {
  async getPageCount(buffer: Buffer): Promise<number> {
    const pdfDoc = await PDFDocument.load(buffer);
    return pdfDoc.getPageCount();
  }

  async extractAndReorderPages(buffer: Buffer, pageIndices: number[]): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(buffer);
    const destDoc = await PDFDocument.create();

    // Copy pages based on the provided pageIndices, preserving the new order
    const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => destDoc.addPage(page));

    const pdfBytes = await destDoc.save();
    return Buffer.from(pdfBytes.buffer);
  }
}
