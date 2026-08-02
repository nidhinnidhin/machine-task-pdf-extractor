import { PdfService } from '@/services/pdf.service';
import type { PdfDocument } from '@/types/pdf';

export class PdfActions {
  static async uploadPdf(file: File): Promise<PdfDocument> {
    return await PdfService.upload(file);
  }

  static async listPdfs(): Promise<PdfDocument[]> {
    return await PdfService.list();
  }

  static async getPdfDetails(id: string): Promise<PdfDocument> {
    return await PdfService.getDetails(id);
  }

  static async extractPages(id: string, pages: number[]): Promise<PdfDocument> {
    return await PdfService.extractPages(id, pages);
  }

  static downloadPdf(id: string): void {
    const url = PdfService.getDownloadUrl(id);
    window.open(url, '_blank');
  }
}
