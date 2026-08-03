import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { IStorageService } from '../../application/interfaces/storage-service.interface';

@Injectable()
export class DiskStorageService implements IStorageService {
  private readonly _uploadDir = path.resolve('uploads');

  async save(key: string, file: Buffer): Promise<string> {
    const filePath = path.join(this._uploadDir, key);
    // Ensure the uploads directory exists
    await fs.mkdir(this._uploadDir, { recursive: true });
    await fs.writeFile(filePath, file);
    return filePath;
  }

  async get(key: string): Promise<Buffer> {
    const filePath = path.isAbsolute(key) ? key : path.join(this._uploadDir, key);
    return await fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.isAbsolute(key) ? key : path.join(this._uploadDir, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore cleanup error if file does not exist
    }
  }
}
