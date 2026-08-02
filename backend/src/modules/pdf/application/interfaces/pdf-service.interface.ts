export interface IPdfService {
  getPageCount(buffer: Buffer): Promise<number>;
  extractAndReorderPages(buffer: Buffer, pageIndices: number[]): Promise<Buffer>;
}
