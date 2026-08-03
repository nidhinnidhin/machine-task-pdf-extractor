import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { IStorageService } from '../../application/interfaces/storage-service.interface';

@Injectable()
export class CloudinaryStorageService implements IStorageService {
  private readonly _folder: string;

  constructor(private readonly _configService: ConfigService) {
    this._folder = this._configService.get<string>('CLOUDINARY_FOLDER') ?? 'pdf_uploads';

    cloudinary.config({
      cloud_name: this._configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this._configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this._configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  /**
   * Saves a file buffer to Cloudinary as a raw resource.
   * @returns The Cloudinary public_id, which is stored in the database as filePath.
   */
  async save(key: string, file: Buffer, _mimetype?: string): Promise<string> {
    // Strip extension from the key so Cloudinary doesn't double-apply it
    const publicId = `${this._folder}/${path.parse(key).name}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'raw',
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload returned no result'));
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(file);
    });

    // Return the Cloudinary public_id as the storage key
    return result.public_id;
  }

  /**
   * Retrieves a file buffer from Cloudinary by its public_id.
   * Falls back to local disk if the key is an absolute filesystem path (legacy records).
   */
  async get(key: string): Promise<Buffer> {
    // Legacy fallback: absolute local disk path from pre-Cloudinary records
    if (path.isAbsolute(key)) {
      return await fs.readFile(key);
    }

    const url = cloudinary.url(key, { resource_type: 'raw', secure: true });
    return this._downloadBuffer(url);
  }

  /**
   * Deletes a file from Cloudinary by its public_id.
   * Falls back to local disk deletion for legacy absolute path records.
   */
  async delete(key: string): Promise<void> {
    if (path.isAbsolute(key)) {
      try {
        await fs.unlink(key);
      } catch {
        // Ignore if local file doesn't exist
      }
      return;
    }

    await cloudinary.uploader.destroy(key, { resource_type: 'raw' });
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private _downloadBuffer(url: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const chunks: Buffer[] = [];

      protocol.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download from Cloudinary. Status: ${res.statusCode}`));
          return;
        }
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  }
}
