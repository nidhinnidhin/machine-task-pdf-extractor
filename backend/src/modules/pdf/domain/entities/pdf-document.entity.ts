export class PdfDocumentEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly filePath: string,
    public readonly fileSize: number,
    public readonly pageCount: number,
    public readonly isGenerated: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
