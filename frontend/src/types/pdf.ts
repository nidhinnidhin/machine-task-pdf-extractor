export interface PdfDocument {
  id: string;
  originalName: string;
  fileSize: number;
  pageCount: number;
  isGenerated: boolean;
  createdAt: string;
}
